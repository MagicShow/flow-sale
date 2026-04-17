const buildScript = ({ id, title, color, topic, sponsorLabel, unionLabel }) => ({
  id,
  title,
  color,
  nodes: {
    start: {
      text: `Hi, I'm calling for [NAME]. Hi [NAME], this is [YOUR NAME] calling regarding your ${topic} on file. Looks like you applied for it through ${unionLabel}, is that correct?`,
      yes: 'intro_confirm',
      no: 'intro_rebuttal',
    },
    intro_rebuttal: {
      text: `No worries, I understand ${unionLabel} may not be familiar. I actually met with [SPONSOR] who sponsored you to receive ${topic}. Does that ring a bell?`,
      yes: 'intro_confirm',
      no: 'intro_confirm',
    },
    intro_confirm: {
      text: `I met with [SPONSOR]. He/she sponsored you to receive $2,000 of ${topic} at no cost and gave you access to some of his/her exclusive benefits through his/her union. Does that make sense?`,
      yes: 'location',
      no: 'location',
    },
    location: {
      text: 'Okay great, I need to confirm the information we have on file for you. Are you currently at home or at work?',
      yes: 'location_work',
      no: 'location_home',
    },
    location_home: {
      text: "I need to confirm the information we have on file for you, and I don't want to distract you if you're currently at work or running errands.",
      yes: 'info_confirm',
      no: null,
    },
    location_work: {
      text: 'Okay, no worries, I don\'t want to distract you, so what time do you typically get off work?',
      yes: 'info_confirm',
      no: null,
    },
    info_confirm: {
      text: 'Okay great, let me confirm some information with you. I have your first name listed as [NAME] and your last name listed as [LAST NAME]. And what\'s your date of birth? And who would you want to list as a beneficiary on your policy?',
      yes: 'spouse_check',
      no: null,
    },
    spouse_check: {
      text: 'Are you single, married, or do you have a significant other?',
      yes: 'spouse_home',
      no: 'spouse_single',
    },
    spouse_home: {
      text: 'Okay awesome, and is [SPOUSE NAME] currently at home with you?',
      yes: 'zoom_spouse',
      no: 'zoom_spouse',
    },
    spouse_single: {
      text: `So, the next step is for us to set up a brief zoom call to walk you through this ${topic} and set you up with the rest of the benefits you were sponsored to receive. So, what time does he/she usually get home?`,
      yes: 'time_pick_spouse',
      no: null,
    },
    zoom_spouse: {
      text: `So, the next step is for us to set up a brief zoom call with you and [SPOUSE NAME] to walk you guys through the claim-filing process and set you up with the rest of your benefits for the year. Are you currently near a laptop or desktop so I can help you join the zoom meeting and get you guys all squared away? Should take about 15-20 minutes.`,
      yes: 'time_pick_spouse',
      no: 'why_zoom_spouse',
    },
    why_zoom_spouse: {
      text: 'Okay no worries, I have openings today at [TIME] or [TIME]. Which will work better for you guys?',
      yes: 'email_capture',
      no: null,
    },
    time_pick_spouse: {
      text: 'Okay sounds good. So, I have openings today at [TIME] or [TIME]. Which will work better for you guys?',
      yes: 'email_capture',
      no: null,
    },
    email_capture: {
      text: "You got it! Let me get your email address and you'll receive a confirmation email with the zoom link to join the meeting today at [TIME]. Go ahead?",
      yes: 'end',
      no: null,
    },
    end: {
      text: "Okay great! You're all set for today at [TIME]. If you have any questions in the meantime, this is my direct line and again my name is [YOUR NAME]. Take care and I'll see you soon! [DO NOT HANG UP UNTIL YOU SEE THE CLIENT ON ZOOM.]",
      yes: null,
      no: null,
    },
  },
})

export const scripts = [
  buildScript({
    id: 'ail_life',
    title: 'AIL — Life Insurance',
    color: '#0071E3',
    topic: 'life insurance',
    sponsorLabel: '[INSERT UNION]',
    unionLabel: '[INSERT UNION]',
  }),
  buildScript({
    id: 'ail_renewal',
    title: 'AIL — Renewal',
    color: '#0071E3',
    topic: 'life insurance renewal',
    sponsorLabel: '[INSERT UNION]',
    unionLabel: '[INSERT UNION]',
  }),
  buildScript({
    id: 'union',
    title: 'Union',
    color: '#34C759',
    topic: 'union membership benefit',
    sponsorLabel: 'your union representative',
    unionLabel: 'your union',
  }),
  buildScript({
    id: 'union_benefits',
    title: 'Union Benefits',
    color: '#34C759',
    topic: 'union member benefits package',
    sponsorLabel: 'your union sponsor',
    unionLabel: 'your union',
  }),
  buildScript({
    id: 'child_safety',
    title: 'Child Safety',
    color: '#FF9500',
    topic: 'child safety benefit',
    sponsorLabel: 'your family benefits sponsor',
    unionLabel: 'your benefits program',
  }),
  buildScript({
    id: 'will',
    title: 'Will',
    color: '#AF52DE',
    topic: 'estate planning / will service',
    sponsorLabel: 'your financial representative',
    unionLabel: 'your benefits program',
  }),
  buildScript({
    id: 'plan_ahead',
    title: 'Plan Ahead',
    color: '#FF2D55',
    topic: 'future planning benefit',
    sponsorLabel: 'your planning specialist',
    unionLabel: 'your benefits program',
  }),
  buildScript({
    id: 'policy_review',
    title: 'Policy Review',
    color: '#5856D6',
    topic: 'policy review session',
    sponsorLabel: 'your insurance advisor',
    unionLabel: 'your coverage program',
  }),
]

export default scripts
