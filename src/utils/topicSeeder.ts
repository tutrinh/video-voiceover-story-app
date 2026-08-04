import { ScriptData, SavedStory } from '../types/script';
import { saveStoryToStorage, getAllSavedStories } from './idbStorage';

export const MASSIVE_TOPICS_DATABASE: Record<string, string[]> = {
  'Motivational & Uplifting Stories': [
    'When you feel like giving up, remember why you started in the first place',
    'How 1 small win today creates unstoppable momentum for your entire week',
    'The story of turning rock bottom into the solid foundation for a new life',
    'Why your current struggle is building the exact strength you need for tomorrow',
    'How 1 random act of kindness from a stranger restored my faith in humanity',
    'The 100-day discipline challenge that proved you are capable of anything',
    'Why it is never too late to reinvent yourself and rewrite your story',
    'How shifting from "I have to" to "I get to" changes your entire day',
    'The inspirational story of someone who started with zero and built an empire',
    'Why the darkest hour comes right before the most beautiful sunrise',
    'How 5 minutes of daily courage can unlock opportunities you never imagined',
    'The uplifting truth about how far you have come despite all the odds',
    'Why your unique voice and story matters to someone who is hurting right now',
    'How forgiving your past self opens the door to your brightest future',
    'The quiet power of showing up every day even when nobody is clapping yet',
    'Why a bump in the road is a chapter in your journey, not the end of your book',
    'How believing in yourself when nobody else does is your ultimate superpower',
    'The small habit of spreading positivity that came back to me 10x over',
    'Why every setback is secretly setup for an incredible comeback',
    'The uplifting reminder that you are stronger than any obstacle in your path'
  ],
  'Everyday Lessons': [
    'What 5 years of overthinking taught me about making real decisions',
    'The awkward conversation I avoided for 3 months (and what happened when I had it)',
    'Why I stopped saying "I am busy" to the people I love',
    'The 10-minute evening walk habit that completely resets my mental health',
    'What losing my keys 3 times in a week taught me about daily mindfulness',
    'Why saying NO to good opportunities is the only way to say YES to great ones',
    'The smallest habit change that cured my 3 PM afternoon energy crash',
    'What I learned after turning off phone notifications for 30 full days',
    'The 1 rule I use to stop letting minor inconveniences ruin my entire day',
    'Why keeping a simple daily gratitude list felt cheesy until it saved my focus',
    'The lesson I learned from a random conversation with a stranger at a coffee shop',
    'What spending 1 hour in total silence every morning taught me about anxiety',
    'Why forgiving yourself for yesterday’s mistake is your greatest productivity secret'
  ],
  'Creator Growth & Viral Hooks': [
    '3 brutal mistakes every beginner creator makes in their first 30 days',
    'The 3-step formula for recording 10 viral reels in under 1 hour',
    'Why nobody is watching your videos (and how to fix your hook in 5 seconds)',
    'Stop editing your reels manually! Use this 3-minute voiceover trick',
    'The secret to talking on camera with 100% confidence with zero script memorization',
    'How to write a scroll-stopping hook that doubles your video retention',
    'Why 90% of creators quit in month 2 (and how to stay in the top 10%)',
    'The 3 video angles that make your Instagram reels look 10x more professional'
  ],
  'Business & Solopreneurship': [
    'How to build a $100k solo business using just voiceover reels',
    'Why traditional sales pitches fail on Instagram (And the 15-second fix)',
    '3 psychological triggers that make followers click your link in bio',
    'How I turned 1,000 views into 10 high-paying clients without paid ads',
    'The exact offer breakdown that generated 50 sales in 24 hours',
    'Why charging higher prices actually makes selling easier'
  ],
  'AI Tools & Automation': [
    '3 hidden AI tools that will save you 20 hours every single week',
    'How to use Claude CLI to automate your entire content calendar',
    'Stop writing scripts from scratch! Let AI generate your reel beats in 10 seconds',
    'How to clone your workflow using local terminal AI agents',
    'The exact prompt structure to get viral reel hooks from LLMs'
  ],
  'Productivity & Time Management': [
    'How I cut my screen time in half using 1 simple iPhone setting',
    'Stop trying to be consistent until you fix this 1 morning habit',
    'Why most online courses fail (And the 5-minute daily replacement)',
    'The 2-minute rule to beat procrastination before it ruins your day',
    'How to batch record 30 days of video content in 1 single afternoon'
  ],
  'Mindset & Confidence': [
    'The 3-step mindset shift to stop feeling awkward or overthinking on camera',
    'The hardest lesson I learned after failing for 6 months straight',
    'Why caring what people think is costing you thousands of dollars',
    'How changing 1 word in your inner monologue changes your results',
    'The truth about overnight success nobody posts on social media'
  ]
};

export const ALL_DATABASE_TOPICS = Object.values(MASSIVE_TOPICS_DATABASE).flat();

// Context-aware topic beats generator for 5 completely distinct, unique beats
export function createScriptFromTopic(topicText: string, index: number): ScriptData {
  const framework = index % 2 === 0 ? 'framework_a' : 'framework_b';
  const duration = (index % 3 === 0 ? 15 : index % 3 === 1 ? 30 : 60);
  const cleanTitle = topicText.length > 40 ? topicText.substring(0, 37) + '...' : topicText;
  const lower = topicText.toLowerCase();

  // Dynamic context builder for Beats 1, 2, 3, 4, 5
  let beat1Text = topicText;
  let beat2Text = `For a long time, I struggled with this exact situation without realizing how much energy it was draining.`;
  let beat3Text = `The turning point happened when I stopped overthinking and committed to 1 practical daily habit.`;
  let beat4Text = `That simple action completely resolved the issue, bringing deep clarity and steady daily progress.`;
  let beat5Text = `Save this video as a reminder for your week, and drop your thoughts in the comments below!`;

  if (lower.includes('walk') || lower.includes('step')) {
    beat1Text = `Leaving my phone behind for a 10-minute walk completely changed my mental health.`;
    beat2Text = `My brain was constantly overloaded with unread messages, leading to constant afternoon anxiety.`;
    beat3Text = `In the first 3 minutes of walking in silence, my thoughts naturally untangled and settled down.`;
    beat4Text = `That daily walk resolved the mental burnout entirely, leaving me deeply present and clear-headed.`;
    beat5Text = `Try a 10-minute walk today, hit save, and tell me how it felt in the comments!`;
  } else if (lower.includes('key') || lower.includes('lose')) {
    beat1Text = `I lost my keys 3 times in a week until I discovered a 2-second mindfulness habit.`;
    beat2Text = `I spent 20 frantic minutes every morning tearing apart cushions while my heart rate spiked.`;
    beat3Text = `I put a dedicated key bowl by the door and forced myself to pause for 2 seconds when setting them down.`;
    beat4Text = `That tiny pause resolved the entire problem—I haven't lost my keys once in over 6 months!`;
    beat5Text = `Save this daily mindfulness tip, and tell me: what object do you lose most often?`;
  } else if (lower.includes('overthink') || lower.includes('decision')) {
    beat1Text = `What 5 years of overthinking taught me about making real decisions.`;
    beat2Text = `I used to agonize over minor choices for hours, suffering from massive decision fatigue before noon.`;
    beat3Text = `I adopted the 2-minute decision rule: if a choice takes under 2 minutes, decide instantly and move on.`;
    beat4Text = `This rule eliminated the overthinking trap completely, freeing up hours of creative focus.`;
    beat5Text = `If overthinking holds you back, hit save and share this rule with a friend!`;
  } else if (lower.includes('courage') || lower.includes('win') || lower.includes('rock bottom')) {
    beat1Text = `How 5 minutes of daily courage can unlock opportunities you never imagined.`;
    beat2Text = `Fear of judgment kept me stuck in place for months, doubting whether I had what it takes to succeed.`;
    beat3Text = `I forced myself to take 1 small, courageous action every morning before self-doubt could talk me out of it.`;
    beat4Text = `That daily habit resolved the fear entirely, replacing hesitation with unstoppable confidence.`;
    beat5Text = `Claim your 5 minutes of courage today, hit save, and drop a 🔥 in the comments!`;
  }

  if (framework === 'framework_a') {
    return {
      id: `topic_script_${Date.now()}_${index}`,
      title: cleanTitle,
      hookHeadline: topicText,
      framework: 'framework_a',
      topic: topicText,
      audience: 'Uplifting Story Audience & Creators',
      tone: 'Motivational & Uplifting',
      estimatedDurationSeconds: duration,
      suggestedVisualTheme: 'Metronic Golden Hour Sunrise',
      engineUsed: 'Claude CLI & AI Generator',
      modelUsed: 'claude-3-7-sonnet-latest',
      createdAt: Date.now() - index * 1800000,
      beats: [
        {
          beatIndex: 0,
          type: 'HOOK',
          header: '01. Spoken Hook',
          text: beat1Text,
          estimatedSeconds: Math.round(duration * 0.15),
          visualCue: 'Direct eye contact, confident uplifting smile',
          highlightKeywords: [beat1Text.split(' ')[0] || 'When', 'remember'],
          deliveryTip: 'Passionate, inspiring, heartfelt tone'
        },
        {
          beatIndex: 1,
          type: 'BEGINNING',
          header: '02. Context & Story Setup',
          text: beat2Text,
          estimatedSeconds: Math.round(duration * 0.20),
          visualCue: 'Warm natural lighting, head nod of encouragement',
          highlightKeywords: ['struggled', 'energy'],
          deliveryTip: 'Empathetic & encouraging'
        },
        {
          beatIndex: 2,
          type: 'MIDDLE',
          header: '03. The Journey & Effort',
          text: beat3Text,
          estimatedSeconds: Math.round(duration * 0.35),
          visualCue: 'Hand over heart gesture, powerful eye contact',
          highlightKeywords: ['turning point', 'daily habit'],
          deliveryTip: 'High impact, inspiring delivery'
        },
        {
          beatIndex: 3,
          type: 'RESOLUTION',
          header: '04. Resolution & Final Outcome',
          text: beat4Text,
          estimatedSeconds: Math.round(duration * 0.15),
          visualCue: 'Bright smile, open palm gesture',
          highlightKeywords: ['completely resolved', 'daily progress'],
          deliveryTip: 'Triumphant & motivating resolution'
        },
        {
          beatIndex: 4,
          type: 'CTA',
          header: '05. Inspiring CTA',
          text: beat5Text,
          estimatedSeconds: Math.round(duration * 0.15),
          visualCue: 'Point to screen, warm gesture',
          highlightKeywords: ['Save this video', 'comments'],
          deliveryTip: 'Uplifting call to action'
        }
      ]
    };
  } else {
    return {
      id: `topic_script_${Date.now()}_${index}`,
      title: cleanTitle,
      hookHeadline: topicText,
      framework: 'framework_b',
      topic: topicText,
      audience: 'Motivational Story Audience',
      tone: 'Inspiring Personal Story',
      estimatedDurationSeconds: duration,
      suggestedVisualTheme: 'Metronic Vibrant Emerald',
      engineUsed: 'Codex CLI & AI Generator',
      modelUsed: 'Codex configured default',
      createdAt: Date.now() - index * 1800000,
      beats: [
        {
          beatIndex: 0,
          type: 'HOOK',
          header: '01. Curiosity Hook',
          text: beat1Text,
          estimatedSeconds: Math.round(duration * 0.15),
          visualCue: 'Powerful engaging posture, bright eye contact',
          highlightKeywords: [beat1Text.split(' ')[0] || 'How', 'superpower'],
          deliveryTip: 'Intriguing, motivational delivery'
        },
        {
          beatIndex: 1,
          type: 'STATE PROBLEM',
          header: '02. State The Obstacle',
          text: beat2Text,
          estimatedSeconds: Math.round(duration * 0.20),
          visualCue: 'Thoughtful pause, genuine expression',
          highlightKeywords: ['obstacle', 'struggled'],
          deliveryTip: 'Honest & authentic tone'
        },
        {
          beatIndex: 2,
          type: 'JOURNEY TO RESOLVE',
          header: '03. The Journey & Effort',
          text: beat3Text,
          estimatedSeconds: Math.round(duration * 0.30),
          visualCue: 'B-roll preview or energetic hand gesture',
          highlightKeywords: ['turning point', 'action'],
          deliveryTip: 'Building hope & energy'
        },
        {
          beatIndex: 3,
          type: 'RESOLUTION',
          header: '04. Resolution & Final Solution',
          text: beat4Text,
          estimatedSeconds: Math.round(duration * 0.20),
          visualCue: 'Confident smile, head held high',
          highlightKeywords: ['resolved', 'clarity'],
          deliveryTip: 'Empowering conviction'
        },
        {
          beatIndex: 4,
          type: 'CTA',
          header: '05. Inspiring CTA',
          text: beat5Text,
          estimatedSeconds: Math.round(duration * 0.15),
          visualCue: 'Point down, text overlay "Save this video"',
          highlightKeywords: ['Save this video', 'comments'],
          deliveryTip: 'High energy call to action'
        }
      ]
    };
  }
}

// Generate & seed a batch of N topics to IndexedDB
export async function seedMassiveTopicsToIndexedDB(count = 25): Promise<number> {
  const existingStories = await getAllSavedStories();
  const existingTitles = new Set(existingStories.map((s) => s.script.title.toLowerCase()));

  const topicsToUse = ALL_DATABASE_TOPICS.sort(() => 0.5 - Math.random()).slice(0, count);

  let addedCount = 0;
  for (let i = 0; i < topicsToUse.length; i++) {
    const topicText = topicsToUse[i];
    const script = createScriptFromTopic(topicText, i);

    if (!existingTitles.has(script.title.toLowerCase())) {
      const story: SavedStory = {
        id: script.id,
        script,
        takes: [],
        updatedAt: script.createdAt,
        tags: [script.framework, `${script.estimatedDurationSeconds}s`, 'Motivational Story'],
      };

      await saveStoryToStorage(story);
      addedCount++;
    }
  }
  return addedCount;
}

export async function seedRandomTopicsToIndexedDB(): Promise<number> {
  return seedMassiveTopicsToIndexedDB(25);
}
