import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 示例数据
const sampleNotes = [
  {
    content: "设计是一个迭代的过程，不是一蹴而就的。最好的设计往往来自于多次尝试和改进。",
    sourceUrl: "https://example.com/design-principles",
    sourceTitle: "设计原则与最佳实践",
    tags: ["设计", "用户体验"]
  },
  {
    content: "React Hook 使用规则：\n1. 只在最顶层使用 Hook\n2. 只在 React 函数组件中调用 Hook\n3. 不要在循环、条件或嵌套函数中调用 Hook",
    sourceUrl: "https://reactjs.org/docs/hooks-rules.html",
    sourceTitle: "Hook 规则 – React",
    tags: ["React", "前端", "编程"]
  },
  {
    content: "PostgreSQL是一个功能强大的开源对象关系数据库系统，有超过30年的积极开发历史，因其可靠性、特性健壮性和性能而赢得了良好的声誉。",
    sourceUrl: "https://www.postgresql.org/about/",
    sourceTitle: "关于PostgreSQL",
    tags: ["数据库", "后端"]
  },
  {
    content: "Next.js提供了两种形式的预渲染：静态生成和服务器端渲染。区别在于为页面生成HTML的时机。",
    sourceUrl: "https://nextjs.org/docs/basic-features/pages",
    sourceTitle: "Next.js Pages",
    tags: ["Next.js", "前端", "React"]
  },
  {
    content: "在有效的写作中，关键是清晰、简洁和具体。避免使用模糊的语言，使用主动语态，并保持段落简短。",
    sourceUrl: "https://example.com/effective-writing",
    sourceTitle: "有效写作的关键原则",
    tags: ["写作", "沟通"]
  },
  {
    content: "Tailwind CSS是一个功能类优先的CSS框架，它集成了诸如flex, pt-4, text-center和rotate-90这样的类，这些类可以直接在脚本标记中组合起来，构建出任何设计。",
    sourceUrl: "https://tailwindcss.com/",
    sourceTitle: "Tailwind CSS - 功能类优先的CSS框架",
    tags: ["CSS", "前端", "设计"]
  },
  {
    content: "TypeScript通过在JavaScript之上添加类型来扩展JavaScript，在运行时将其转换为JavaScript。因此，没有运行时开销，只是编译时类型检查。",
    sourceUrl: "https://www.typescriptlang.org/",
    sourceTitle: "TypeScript - JavaScript的超集",
    tags: ["TypeScript", "编程", "JavaScript"]
  },
  {
    content: "健康生活的五个关键因素：均衡饮食、规律运动、充足睡眠、压力管理和定期体检。",
    sourceUrl: "https://example.com/healthy-living",
    sourceTitle: "健康生活指南",
    tags: ["健康", "生活"]
  },
  {
    content: "有效的时间管理策略包括：设定明确的目标、优先处理重要任务、减少干扰、学会委派工作，以及定期评估和调整您的方法。",
    sourceUrl: "https://example.com/time-management",
    sourceTitle: "提高效率的时间管理技巧",
    tags: ["时间管理", "效率", "工作"]
  },
  {
    content: "这是一条没有标签的笔记，用于测试无标签的显示效果。这条笔记还可以测试内容超长情况下的显示效果。当内容太长时，应该显示省略号表示有更多内容。",
    sourceUrl: "https://example.com/no-tags",
    sourceTitle: "测试笔记 - 无标签",
    tags: []
  }
];

export async function GET() {
  try {
    // 清除现有数据
    await prisma.note.deleteMany();
    await prisma.tag.deleteMany();
    
    // 创建示例数据
    for (const sampleNote of sampleNotes) {
      // 处理标签
      const tags = await Promise.all(
        sampleNote.tags.map(async (tagName) => {
          return await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
          });
        })
      );
      
      // 创建笔记
      await prisma.note.create({
        data: {
          content: sampleNote.content,
          sourceUrl: sampleNote.sourceUrl,
          sourceTitle: sampleNote.sourceTitle,
          tags: {
            connect: tags.map(tag => ({ id: tag.id }))
          }
        }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `成功创建 ${sampleNotes.length} 条示例笔记。` 
    });
  } catch (error) {
    console.error('生成示例数据失败:', error);
    return NextResponse.json(
      { error: '生成示例数据失败，请查看服务器日志。' },
      { status: 500 }
    );
  }
} 