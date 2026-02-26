import type { ContentBlock } from '@/types';

export const sampleArticles = [
  {
    title: "The Future of Systems Innovation in Enterprise Architecture",
    slug: "future-systems-innovation-enterprise-architecture",
    excerpt: "Exploring how modern enterprises are leveraging systems thinking to build more resilient, adaptive, and innovative organizational structures.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "In today's rapidly evolving business landscape, organizations must embrace systems innovation to remain competitive. This comprehensive approach to enterprise architecture goes beyond traditional siloed thinking, fostering interconnected solutions that drive sustainable growth.",
        order: 1
      },
      {
        id: "2",
        type: "heading" as const,
        content: "Understanding Systems Innovation",
        metadata: { level: 2 },
        order: 2
      },
      {
        id: "3",
        type: "paragraph" as const,
        content: "Systems innovation represents a paradigm shift in how we approach organizational challenges. Rather than addressing symptoms in isolation, it focuses on understanding and optimizing the entire ecosystem of people, processes, and technologies.",
        order: 3
      },
      {
        id: "4",
        type: "quote" as const,
        content: "The most successful organizations of the future will be those that can see their entire system and optimize for the whole, not just the parts.",
        metadata: { author: "Alvin Silva", source: "Systems Thinking Quarterly" },
        order: 4
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop",
    read_time: 8,
    category_slug: "systems-innovations",
    tags: ["Innovation", "Strategy", "Technology"],
    featured: true,
    meta_title: "Systems Innovation in Enterprise Architecture | ASilva Innovations",
    meta_description: "Discover how systems thinking transforms enterprise architecture for sustainable competitive advantage."
  },
  {
    title: "Integrated Risk Management: A Holistic Approach",
    slug: "integrated-risk-management-holistic-approach",
    excerpt: "Why traditional risk management approaches fall short and how integrated frameworks provide comprehensive protection for modern organizations.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Traditional risk management often operates in silos, with different departments managing their own risks independently. This fragmented approach leaves organizations vulnerable to interconnected threats that span multiple domains.",
        order: 1
      },
      {
        id: "2",
        type: "heading" as const,
        content: "The Case for Integration",
        metadata: { level: 2 },
        order: 2
      },
      {
        id: "3",
        type: "paragraph" as const,
        content: "Integrated Risk Management (IRM) brings together all risk disciplines—operational, financial, strategic, and compliance—into a unified framework. This holistic view enables organizations to identify correlations between risks and develop more effective mitigation strategies.",
        order: 3
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&h=630&fit=crop",
    read_time: 6,
    category_slug: "integrated-risk-management",
    tags: ["Strategy", "Leadership"],
    featured: true
  },
  {
    title: "Building Organizational Resilience in Uncertain Times",
    slug: "building-organizational-resilience",
    excerpt: "Key strategies for developing adaptive capacity that helps organizations thrive amid disruption and uncertainty.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Resilience is no longer just a buzzword—it's a critical organizational capability. In an era of constant change and disruption, the ability to adapt, recover, and even thrive in the face of challenges separates market leaders from laggards.",
        order: 1
      },
      {
        id: "2",
        type: "callout" as const,
        content: "Resilient organizations don't just survive disruptions—they use them as catalysts for transformation and growth.",
        metadata: { type: "tip" },
        order: 2
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=630&fit=crop",
    read_time: 7,
    category_slug: "resilience",
    tags: ["Leadership", "Transformation"],
    featured: true
  },
  {
    title: "AI and Analytics: Transforming Decision-Making",
    slug: "ai-analytics-transforming-decision-making",
    excerpt: "How artificial intelligence and advanced analytics are revolutionizing the way organizations make strategic decisions.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "The convergence of artificial intelligence and advanced analytics is creating unprecedented opportunities for data-driven decision-making. Organizations that successfully harness these technologies gain significant competitive advantages.",
        order: 1
      },
      {
        id: "2",
        type: "heading" as const,
        content: "The AI-Powered Enterprise",
        metadata: { level: 2 },
        order: 2
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop",
    read_time: 9,
    category_slug: "ai-and-analytics",
    tags: ["AI", "Data", "Technology"],
    featured: true
  },
  {
    title: "Real-Time Leadership: Navigating Dynamic Environments",
    slug: "real-time-leadership-dynamic-environments",
    excerpt: "The essential skills and mindsets leaders need to guide their organizations through rapidly changing business landscapes.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Leadership in the modern era requires a fundamentally different approach. The pace of change demands leaders who can make decisions quickly, adapt to new information, and guide their teams through uncertainty with confidence.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=630&fit=crop",
    read_time: 6,
    category_slug: "real-time-leadership",
    tags: ["Leadership", "Strategy"],
    featured: true
  },
  {
    title: "Designing Adaptive Systems for Complex Challenges",
    slug: "designing-adaptive-systems",
    excerpt: "A deep dive into the principles and practices of creating systems that can evolve and adapt to changing requirements.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Adaptive systems are designed to evolve in response to changing conditions. Unlike rigid systems that require complete overhauls when requirements shift, adaptive systems can modify their behavior and structure while maintaining core functionality.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop",
    read_time: 10,
    category_slug: "systems-innovations",
    tags: ["Innovation", "Technology"]
  },
  {
    title: "Cybersecurity Risk in the Modern Enterprise",
    slug: "cybersecurity-risk-modern-enterprise",
    excerpt: "Understanding and mitigating the evolving cybersecurity threats facing organizations in an increasingly digital world.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Cybersecurity has evolved from a technical concern to a strategic business imperative. As organizations become increasingly digitized, the potential impact of security breaches has grown exponentially.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=630&fit=crop",
    read_time: 8,
    category_slug: "integrated-risk-management",
    tags: ["Technology", "Strategy"]
  },
  {
    title: "Crisis Recovery: Lessons from Resilient Organizations",
    slug: "crisis-recovery-lessons",
    excerpt: "What we can learn from organizations that have successfully navigated major crises and emerged stronger.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Every crisis presents both danger and opportunity. Organizations that approach disruptions with a resilience mindset can not only survive but use these experiences as catalysts for positive transformation.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    read_time: 7,
    category_slug: "resilience",
    tags: ["Leadership", "Transformation"]
  },
  {
    title: "Machine Learning for Business Intelligence",
    slug: "machine-learning-business-intelligence",
    excerpt: "Practical applications of machine learning that are transforming how organizations extract insights from their data.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Machine learning is no longer the exclusive domain of data scientists. Modern tools and platforms are making these powerful technologies accessible to business analysts and decision-makers across the organization.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop",
    read_time: 9,
    category_slug: "ai-and-analytics",
    tags: ["AI", "Data", "Technology"]
  },
  {
    title: "The Agile Leadership Mindset",
    slug: "agile-leadership-mindset",
    excerpt: "How agile principles are reshaping leadership practices and organizational culture for the better.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Agile leadership goes beyond implementing agile methodologies—it's about embodying the values and principles that enable teams to deliver value quickly and respond to change effectively.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1200&h=630&fit=crop",
    read_time: 6,
    category_slug: "real-time-leadership",
    tags: ["Leadership", "Transformation"]
  },
  {
    title: "Systems Thinking in Product Development",
    slug: "systems-thinking-product-development",
    excerpt: "Applying systems thinking principles to create more successful and sustainable products.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Product development doesn't happen in isolation. Every product exists within a complex ecosystem of users, competitors, technologies, and market forces. Systems thinking helps product teams navigate this complexity.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&h=630&fit=crop",
    read_time: 8,
    category_slug: "systems-innovations",
    tags: ["Innovation", "Strategy"]
  },
  {
    title: "Operational Risk: Beyond Compliance",
    slug: "operational-risk-beyond-compliance",
    excerpt: "Moving beyond checkbox compliance to build genuine operational resilience.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Too many organizations view operational risk management as a compliance exercise. The most resilient companies understand that effective risk management is a source of competitive advantage.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=630&fit=crop",
    read_time: 7,
    category_slug: "integrated-risk-management",
    tags: ["Strategy", "Leadership"]
  },
  {
    title: "Building Team Resilience Under Pressure",
    slug: "building-team-resilience",
    excerpt: "Strategies for developing teams that can maintain performance and well-being during challenging periods.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Team resilience is the capacity of a group to withstand and adapt to challenges while maintaining its core function and relationships. It's a critical capability in today's high-pressure work environments.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop",
    read_time: 6,
    category_slug: "resilience",
    tags: ["Leadership"]
  },
  {
    title: "Predictive Analytics: From Insight to Action",
    slug: "predictive-analytics-insight-action",
    excerpt: "How to turn predictive insights into concrete business actions and measurable outcomes.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Predictive analytics has the potential to transform decision-making, but only if organizations can bridge the gap between insight and action. This requires both technical capabilities and organizational readiness.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    read_time: 8,
    category_slug: "ai-and-analytics",
    tags: ["Data", "Strategy"]
  },
  {
    title: "Decision-Making in High-Velocity Environments",
    slug: "decision-making-high-velocity",
    excerpt: "Frameworks and techniques for making effective decisions when time is limited and stakes are high.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Leaders in fast-moving environments face a unique challenge: they must make important decisions quickly, often with incomplete information. The ability to do this effectively is a key differentiator for successful leaders.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop",
    read_time: 7,
    category_slug: "real-time-leadership",
    tags: ["Leadership", "Strategy"]
  },
  {
    title: "The Architecture of Innovation",
    slug: "architecture-of-innovation",
    excerpt: "Designing organizational structures and processes that foster continuous innovation.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Innovation doesn't happen by accident. The most innovative organizations deliberately design their structures, processes, and cultures to support and encourage creative thinking and experimentation.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop",
    read_time: 9,
    category_slug: "systems-innovations",
    tags: ["Innovation", "Strategy"]
  },
  {
    title: "Third-Party Risk Management Strategies",
    slug: "third-party-risk-management",
    excerpt: "Managing the risks that come with an increasingly interconnected business ecosystem.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "As organizations become more reliant on third-party vendors and partners, managing the associated risks has become a critical capability. A single weak link in the supply chain can have devastating consequences.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=630&fit=crop",
    read_time: 7,
    category_slug: "integrated-risk-management",
    tags: ["Strategy"]
  },
  {
    title: "Organizational Learning from Failure",
    slug: "organizational-learning-failure",
    excerpt: "Creating cultures that embrace failure as a learning opportunity and catalyst for improvement.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Failure is inevitable in any organization that takes risks and pursues innovation. The question is not whether failures will occur, but how the organization responds to them. The most resilient organizations treat failures as valuable learning opportunities.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=630&fit=crop",
    read_time: 6,
    category_slug: "resilience",
    tags: ["Leadership", "Transformation"]
  },
  {
    title: "Natural Language Processing for Business",
    slug: "nlp-for-business",
    excerpt: "Practical applications of NLP that are transforming customer service, content creation, and knowledge management.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Natural Language Processing (NLP) has moved from research labs to business applications at an unprecedented pace. Organizations are using NLP to automate customer interactions, analyze sentiment, extract insights from documents, and much more.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&h=630&fit=crop",
    read_time: 8,
    category_slug: "ai-and-analytics",
    tags: ["AI", "Technology"]
  },
  {
    title: "Leading Through Digital Transformation",
    slug: "leading-digital-transformation",
    excerpt: "The critical role of leadership in successfully navigating digital transformation initiatives.",
    content: [
      {
        id: "1",
        type: "paragraph" as const,
        content: "Digital transformation is as much about leadership as it is about technology. Successful transformations require leaders who can articulate a compelling vision, build organizational capability, and navigate the inevitable challenges that arise.",
        order: 1
      }
    ] as ContentBlock[],
    featured_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop",
    read_time: 7,
    category_slug: "real-time-leadership",
    tags: ["Leadership", "Digital", "Transformation"]
  }
];

export const authorData = {
  name: "Alvin Silva",
  email: "alvin.silva@asilvainnovations.com",
  bio: "Founder and CEO of ASilva Innovations. Alvin is a recognized thought leader in systems innovation, risk management, and organizational resilience. With over 20 years of experience helping organizations navigate complex challenges, he brings a unique perspective on building adaptive, high-performing enterprises.",
  avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  role: "admin",
  social_links: {
    twitter: "https://twitter.com/alvinsilva",
    linkedin: "https://linkedin.com/in/alvinsilva",
    website: "https://asilvainnovations.com"
  }
};
