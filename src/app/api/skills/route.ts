import { NextResponse } from 'next/server';
import { getR2Client, getR2Bucket, queryD1 } from '@/lib/cloudflare';
import { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;
  if (!sessionId) return null;
  const sql = `SELECT username, role FROM users WHERE session_id = ?`;
  const users = await queryD1(sql, [sessionId]);
  return users[0] || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const user = await getCurrentUser();

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    
    // For 'private', only show the logged-in user's files
    let prefix = folder ? `${folder}/` : '';
    if (folder === 'private') {
      if (!user) {
        return NextResponse.json({ success: true, files: [] });
      }
      prefix = `private/${user.username}/`;
    }

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });
    const response = await s3.send(command);
    
    let files = (response.Contents || [])
      .filter(item => item.Key && !item.Key.endsWith('/'))
      .map(item => {
        const parts = item.Key!.split('/');
        const fileFolder = parts[0];
        let owner = '';
        let filename = item.Key!.split('/').pop() || item.Key!;
        
        // Structure is folder/username/filename OR folder/filename (legacy)
        if (parts.length >= 3) {
          owner = parts[1];
        }

        return {
          key: item.Key!,
          filename,
          size: item.Size!,
          lastModified: item.LastModified!.toISOString(),
          folder: fileFolder,
          owner
        };
      });
      
    // If public folder, we still get everything under public/, which might include public/username/file.md
    
    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, content, folder, existingKey } = await request.json();
    if (!filename || content === undefined) {
      return NextResponse.json({ success: false, error: 'Filename and content are required' }, { status: 400 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    const targetFolder = folder || 'private';
    
    let key = `${targetFolder}/${user.username}/${filename}`;

    // If overwriting an existing file
    if (existingKey) {
      const parts = existingKey.split('/');
      const owner = parts.length >= 3 ? parts[1] : '';
      if (user.role === 'admin' || owner === user.username) {
        key = existingKey;
      }
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content,
      ContentType: 'text/markdown; charset=utf-8',
    });

    await s3.send(command);
    return NextResponse.json({ success: true, key });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }

    // Check ownership
    const parts = key.split('/');
    const owner = parts.length >= 3 ? parts[1] : '';
    
    if (user.role !== 'admin' && owner !== user.username) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not own this file' }, { status: 403 });
    }

    const s3 = getR2Client();
    const bucket = getR2Bucket();
    
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3.send(command);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

