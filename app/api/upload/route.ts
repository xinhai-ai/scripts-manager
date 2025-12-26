import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 创建 uploads 目录
    const uploadsDir = join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // 生成唯一文件名
    const ext = file.name.split('.').pop();
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(uploadsDir, filename);

    // 保存文件
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // 保存文件信息到数据库
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({
      id: uploadedFile.id,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName,
      size: uploadedFile.size,
      url: `/api/files/${uploadedFile.id}`,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const files = await prisma.uploadedFile.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      files.map((file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
        url: `/api/files/${file.id}`,
      }))
    );
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const file = await prisma.uploadedFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // 删除文件
    const { unlink } = await import('fs/promises');
    const filepath = join(process.cwd(), 'uploads', file.filename);
    try {
      await unlink(filepath);
    } catch {
      // 文件可能已被删除
    }

    // 从数据库删除记录
    await prisma.uploadedFile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
