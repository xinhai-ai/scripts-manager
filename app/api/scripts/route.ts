import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const script = await prisma.script.findUnique({
        where: { id },
        include: {
          _count: {
            select: { usages: true },
          },
          category: true,
        },
      });

      if (!script) {
        return NextResponse.json(
          { error: 'Script not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(script);
    }

    const scripts = await prisma.script.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { usages: true },
        },
        category: true,
      },
    });

    return NextResponse.json(scripts);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, content, categoryId, requireAdmin, bypassExecutionPolicy } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    const script = await prisma.script.create({
      data: {
        name,
        description: description || '',
        content,
        categoryId: categoryId || null,
        requireAdmin: requireAdmin === true,
        bypassExecutionPolicy: bypassExecutionPolicy !== false,
      },
    });

    return NextResponse.json(script, { status: 201 });
  } catch (error) {
    console.error('Error creating script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, content, categoryId, requireAdmin, bypassExecutionPolicy } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Script ID is required' },
        { status: 400 }
      );
    }

    const script = await prisma.script.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(content && { content }),
        ...(categoryId !== undefined && { categoryId }),
        ...(requireAdmin !== undefined && { requireAdmin }),
        ...(bypassExecutionPolicy !== undefined && { bypassExecutionPolicy }),
      },
    });

    return NextResponse.json(script);
  } catch (error) {
    console.error('Error updating script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
        { error: 'Script ID is required' },
        { status: 400 }
      );
    }

    await prisma.script.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
