export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: 'all' | 'work' | 'personal' | 'creative' | 'planning';
  badge?: string;
  icon: string;
  color: string;
  defaultTitle: string;
  content: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Capture agenda, attendees, key decisions, and action items with interactive checklists.',
    category: 'work',
    badge: 'Popular',
    icon: 'Users',
    color: '#4f46e5',
    defaultTitle: 'Meeting Notes — ',
    content: `
      <h2>🎯 Meeting Objective</h2>
      <p>Briefly describe the primary purpose of this meeting and expected outcomes.</p>
      
      <h3>👥 Attendees</h3>
      <p><strong>Organizer:</strong> [Name]</p>
      <p><strong>Participants:</strong> [Participant 1], [Participant 2], [Participant 3]</p>
      
      <hr />
      
      <h2>📋 Agenda & Discussion Points</h2>
      <ul>
        <li><strong>Topic 1:</strong> Current progress and milestone review</li>
        <li><strong>Topic 2:</strong> Key blockers and resource constraints</li>
        <li><strong>Topic 3:</strong> Strategy alignment for upcoming sprint</li>
      </ul>
      
      <blockquote><strong>Key Decision:</strong> Document any consensus or major decision reached during the conversation here.</blockquote>
      
      <hr />
      
      <h2>✅ Action Items</h2>
      <ul data-type="taskList">
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Follow up with design team regarding final prototypes</p></div></li>
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Update API specification documentation</p></div></li>
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Schedule next sync for Thursday at 2:00 PM</p></div></li>
      </ul>
    `
  },
  {
    id: 'project-spec',
    title: 'Project Specification',
    description: 'Define technical specs, architectural decisions, timelines, and deliverable milestones.',
    category: 'planning',
    badge: 'Technical',
    icon: 'Layers',
    color: '#0ea5e9',
    defaultTitle: 'Project Spec: ',
    content: `
      <h2>1. Executive Summary</h2>
      <p>High-level overview of the feature, architecture change, or initiative and why it is critical.</p>
      
      <h2>2. Goals & Non-Goals</h2>
      <p><strong>Goals:</strong></p>
      <ul>
        <li>Deliver high-performance client-side search across offline documents</li>
        <li>Ensure sub-100ms response times for all editor operations</li>
      </ul>
      <p><strong>Non-Goals:</strong></p>
      <ul>
        <li>Real-time multi-cursor collaboration (deferred to v2)</li>
      </ul>
      
      <hr />
      
      <h2>3. Architecture & Data Model</h2>
      <table>
        <thead>
          <tr>
            <th>Entity</th>
            <th>Storage Layer</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Documents</td>
            <td>Dexie / IndexedDB</td>
            <td>Stores HTML content, metadata, timestamps</td>
          </tr>
          <tr>
            <td>Versions</td>
            <td>Dexie / IndexedDB</td>
            <td>Historical snapshot diffs for rollback</td>
          </tr>
          <tr>
            <td>Sync State</td>
            <td>Firestore</td>
            <td>Multi-device cloud synchronization</td>
          </tr>
        </tbody>
      </table>
      
      <hr />
      
      <h2>4. Milestones & Timeline</h2>
      <ul data-type="taskList">
        <li data-checked="true"><label><input type="checkbox" checked /></label><div><p>Phase 1: Architecture review and schema setup</p></div></li>
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Phase 2: Core implementation & component build</p></div></li>
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Phase 3: QA testing & performance benchmarks</p></div></li>
      </ul>
    `
  },
  {
    id: 'brainstorming',
    title: 'Brainstorming Session',
    description: 'Structure raw creative ideas, compare pros and cons, and synthesize actionable solutions.',
    category: 'creative',
    badge: 'Idea Forge',
    icon: 'Lightbulb',
    color: '#f59e0b',
    defaultTitle: 'Brainstorm: ',
    content: `
      <h2>💡 The Core Problem</h2>
      <p>What fundamental problem or user friction are we trying to solve?</p>
      
      <hr />
      
      <h2>🌪️ Idea Dump</h2>
      <p>No bad ideas — capture everything freely:</p>
      <ul>
        <li><strong>Idea A:</strong> AI-assisted auto-summarization and outline generation</li>
        <li><strong>Idea B:</strong> Visual graph of connected thoughts and tags</li>
        <li><strong>Idea C:</strong> Zen typewriter mode with ambient lofi audio</li>
      </ul>
      
      <hr />
      
      <h2>⚖️ Options Evaluation</h2>
      <table>
        <thead>
          <tr>
            <th>Approach</th>
            <th>Pros</th>
            <th>Cons / Risks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Option 1</td>
            <td>Fast to implement, high user value</td>
            <td>Requires local database indexing</td>
          </tr>
          <tr>
            <td>Option 2</td>
            <td>Visually stunning and differentiated</td>
            <td>Higher rendering complexity on mobile</td>
          </tr>
        </tbody>
      </table>
      
      <hr />
      
      <h2>🚀 Selected Next Step</h2>
      <p>Synthesize the top insight from this brainstorm session and specify the immediate experiment.</p>
    `
  },
  {
    id: 'daily-journal',
    title: 'Daily Journal & Reflection',
    description: 'Cultivate clarity, daily focus, gratitude, and mindful goal-setting.',
    category: 'personal',
    badge: 'Mindful',
    icon: 'Sun',
    color: '#10b981',
    defaultTitle: 'Journal — ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    content: `
      <h2>🌅 Morning Focus</h2>
      <p><strong>Top 3 Priorities for Today:</strong></p>
      <ul data-type="taskList">
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Deep work: Finish high-priority task</p></div></li>
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Team alignment: Review pull requests and specs</p></div></li>
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Health: 30 minutes outdoor exercise</p></div></li>
      </ul>
      
      <hr />
      
      <h2>🙏 Gratitude & Awareness</h2>
      <p>What are 3 things I am grateful for right now?</p>
      <ul>
        <li>1. A quiet morning with coffee and clear thoughts</li>
        <li>2. Supportive colleagues and inspiring projects</li>
        <li>3. The opportunity to learn and grow every day</li>
      </ul>
      
      <hr />
      
      <h2>🌙 Evening Reflection</h2>
      <p><strong>What went well today?</strong></p>
      <p>Write your thoughts on what went smoothly and what gave you energy...</p>
      
      <p><strong>What could have been improved?</strong></p>
      <p>Note down any adjustments for tomorrow...</p>
    `
  },
  {
    id: 'blog-post',
    title: 'Blog Post / Article',
    description: 'Craft compelling essays and articles with hook, narrative flow, quotes, and call to action.',
    category: 'creative',
    badge: 'Writing',
    icon: 'PenTool',
    color: '#8b5cf6',
    defaultTitle: 'Article: ',
    content: `
      <h2>The Hook: Opening Statement</h2>
      <p>Start with a provocative observation, an unexpected statistic, or a personal story that hooks the reader in the first two sentences.</p>
      
      <hr />
      
      <h2>The Core Thesis</h2>
      <p>State clearly what this article is about and what unique viewpoint you are providing to the reader.</p>
      
      <blockquote>“The secret to great writing is not having time, it is making space for curiosity.”</blockquote>
      
      <hr />
      
      <h2>Main Arguments & Supporting Evidence</h2>
      <h3>1. The Shift in Perspective</h3>
      <p>Explain the first major idea. Provide concrete real-world examples and data points.</p>
      
      <h3>2. Why Traditional Solutions Fall Short</h3>
      <p>Contrast common assumptions with the reality of how things work in practice.</p>
      
      <hr />
      
      <h2>Takeaways & Call to Action</h2>
      <p>Summarize the single most actionable takeaway for the reader to try today.</p>
    `
  },
  {
    id: 'weekly-review',
    title: 'Weekly Review',
    description: 'Reflect on wins, audit productivity metrics, address challenges, and prepare for the week ahead.',
    category: 'planning',
    badge: 'Review',
    icon: 'Calendar',
    color: '#ec4899',
    defaultTitle: 'Weekly Review: Week of ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    content: `
      <h2>🏆 Highlights & Wins</h2>
      <p>List the key accomplishments and positive breakthroughs of the past 7 days:</p>
      <ul>
        <li>Completed milestone 1 ahead of schedule</li>
        <li>Maintained continuous writing habit every morning</li>
      </ul>
      
      <hr />
      
      <h2>📊 Weekly Scorecard</h2>
      <table>
        <thead>
          <tr>
            <th>Focus Area</th>
            <th>Planned Goal</th>
            <th>Outcome</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Writing</td>
            <td>5,000 words</td>
            <td>5,420 words</td>
            <td>✅ Met</td>
          </tr>
          <tr>
            <td>Development</td>
            <td>Deploy v1 release</td>
            <td>Passed all test suites</td>
            <td>✅ Met</td>
          </tr>
          <tr>
            <td>Reading</td>
            <td>Read 1 chapter/day</td>
            <td>5 of 7 days</td>
            <td>⚠️ In Progress</td>
          </tr>
        </tbody>
      </table>
      
      <hr />
      
      <h2>🎯 Next Week's Top 3 Objectives</h2>
      <ul data-type="taskList">
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Deliver the next feature release</p></div></li>
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Conduct customer feedback sessions</p></div></li>
        <li data-checked="false"><label><input type="checkbox" /></label><div><p>Organize and archive completed project notes</p></div></li>
      </ul>
    `
  }
];
