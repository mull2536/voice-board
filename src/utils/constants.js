// Category configuration with colors and gradients
export const CATEGORIES = [
  {
    id: 'basic',
    name: 'Basic',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 20%)',
    buttonGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'emotions',
    name: 'Emotions',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 20%)',
    buttonGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 'needs',
    name: 'Needs',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 20%)',
    buttonGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    id: 'responses',
    name: 'Responses',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 20%)',
    buttonGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    id: 'fun',
    name: 'Fun',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 20%)',
    buttonGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
];

// Audio tags for ElevenLabs TTS
export const AUDIO_TAGS = [
  { id: 'laughing', label: 'Laughing', tag: '[laughing]' },
  { id: 'excited', label: 'Excited', tag: '[excited]' },
  { id: 'sighing', label: 'Sighing', tag: '[sighing]' },
  { id: 'calmly', label: 'Calmly', tag: '[calmly]' },
  { id: 'yelling', label: 'Yelling', tag: '[yelling]' },
  { id: 'whispering', label: 'Whispering', tag: '[whispering]' },
  { id: 'crying', label: 'Crying', tag: '[crying]' },
  { id: 'cheerful', label: 'Cheerful', tag: '[cheerful]' },
  { id: 'angry', label: 'Angry', tag: '[angry]' },
  { id: 'sad', label: 'Sad', tag: '[sad]' },
  { id: 'custom', label: 'Custom', tag: '' }
];

// Button types
export const BUTTON_TYPES = [
  { id: 'speech', label: 'Speech', icon: '🗣️' },
  { id: 'sound_effect', label: 'Sound Effect', icon: '🔊' },
  { id: 'music', label: 'Music', icon: '🎵' }
];

// Default grid data for each category
export const DEFAULT_GRID_DATA = {
  basic: [
    { id: 1, label: 'I need some help please', type: 'speech', content: 'I need some help please', audioTag: '', emoji: '🙋' },
    { id: 2, label: 'Thank you so much', type: 'speech', content: '[cheerful] Thank you so much', audioTag: 'cheerful', emoji: '🙏' },
    { id: 3, label: 'Yes, I agree', type: 'speech', content: '[excited] Yes, I agree with that', audioTag: 'excited', emoji: '✅' },
    { id: 4, label: 'No, I disagree', type: 'speech', content: '[calmly] No, I disagree with that', audioTag: 'calmly', emoji: '❌' },
    { id: 5, label: 'Can I have some water please', type: 'speech', content: '[calmly] Can I have some water please', audioTag: 'calmly', emoji: '💧' },
    { id: 6, label: 'I would like something to eat', type: 'speech', content: '[cheerful] I would like something to eat', audioTag: 'cheerful', emoji: '🍽️' },
    { id: 7, label: 'I need to use the bathroom', type: 'speech', content: '[nervously] I need to use the bathroom', audioTag: 'nervously', emoji: '🚽' },
    { id: 8, label: 'I need my medicine now', type: 'speech', content: '[calmly] I need my medicine now', audioTag: 'calmly', emoji: '💊' },
    { id: 9, label: 'I am feeling very tired', type: 'speech', content: '[sighing] I am feeling very tired right now', audioTag: 'sighing', emoji: '😴' },
    { id: 10, label: 'IT IS TOO HOT IN HERE!', type: 'speech', content: '[yelling] IT IS TOO HOT IN HERE!', audioTag: 'yelling', emoji: '🌡️' },
    { id: 11, label: 'I feel so cold right now', type: 'speech', content: '[whispering] I feel so cold right now', audioTag: 'whispering', emoji: '❄️' },
    { id: 12, label: 'I AM IN TERRIBLE PAIN!', type: 'speech', content: '[screaming] I AM IN TERRIBLE PAIN!', audioTag: 'screaming', emoji: '😣' },
    { id: 13, label: 'Can we please watch television', type: 'speech', content: '[calmly] Can we please watch television', audioTag: 'calmly', emoji: '📺' },
    { id: 14, label: 'I would love to listen to music', type: 'speech', content: '[singing] I would love to listen to music', audioTag: 'singing', emoji: '🎵' },
    { id: 15, label: 'Please be more quiet', type: 'speech', content: '[whispering] Please be more quiet', audioTag: 'whispering', emoji: '🤫' },
    { id: 16, label: 'CAN YOU SPEAK LOUDER PLEASE!', type: 'speech', content: '[yelling] CAN YOU SPEAK LOUDER PLEASE!', audioTag: 'yelling', emoji: '🔊' },
    { id: 17, label: 'Please wait just a moment', type: 'speech', content: '[calmly] Please wait just a moment', audioTag: 'calmly', emoji: '✋' },
    { id: 18, label: 'Please come over here', type: 'speech', content: '[laughing] Please come over here', audioTag: 'laughing', emoji: '👋' },
    { id: 19, label: 'PLEASE STOP THAT RIGHT NOW!', type: 'speech', content: '[angry] PLEASE STOP THAT RIGHT NOW!', audioTag: 'angry', emoji: '🛑' },
    { id: 20, label: 'Please continue what you were doing', type: 'speech', content: '[cheerful] Please continue what you were doing', audioTag: 'cheerful', emoji: '▶️' },
    ...Array.from({ length: 16 }, (_, i) => ({
      id: 21 + i,
      label: `Button ${21 + i}`,
      type: 'speech',
      content: 'Empty button',
      audioTag: '',
      emoji: '🔘'
    }))
  ],
  emotions: [
    { id: 1, label: 'I am feeling so incredibly happy', type: 'speech', content: '[laughing loud] I am feeling so incredibly happy right now', audioTag: 'laughing loud', emoji: '😊' },
    { id: 2, label: 'I feel very sad and upset', type: 'speech', content: '[crying] I feel very sad and upset about this', audioTag: 'crying', emoji: '😢' },
    { id: 3, label: 'I AM SO EXCITED ABOUT THIS!', type: 'speech', content: '[screaming] I AM SO EXCITED ABOUT THIS!', audioTag: 'screaming', emoji: '🤩' },
    { id: 4, label: 'I am really worried about this situation', type: 'speech', content: '[nervously] I am really worried about this situation', audioTag: 'nervously', emoji: '😟' },
    { id: 5, label: 'THIS MAKES ME SO ANGRY!', type: 'speech', content: '[angry] THIS MAKES ME SO ANGRY!', audioTag: 'angry', emoji: '😠' },
    { id: 6, label: 'I am completely confused about this', type: 'speech', content: '[sighing] I am completely confused about this', audioTag: 'sighing', emoji: '😕' },
    { id: 7, label: 'This is extremely frustrating for me', type: 'speech', content: '[coughing] This is extremely frustrating for me', audioTag: 'coughing', emoji: '😤' },
    { id: 8, label: 'I am deeply grateful for everything', type: 'speech', content: '[cheerful] I am deeply grateful for everything you have done', audioTag: 'cheerful', emoji: '🙏' },
    { id: 9, label: 'I feel so lonely and isolated', type: 'speech', content: '[whispering] I feel so lonely and isolated right now', audioTag: 'whispering', emoji: '😔' },
    { id: 10, label: 'I feel incredibly proud of myself', type: 'speech', content: '[singing] I feel incredibly proud of myself today', audioTag: 'singing', emoji: '😌' },
    { id: 11, label: 'I am really scared about this', type: 'speech', content: '[nervously] I am really scared about what might happen', audioTag: 'nervously', emoji: '😨' },
    { id: 12, label: 'WOW THAT IS SO SURPRISING!', type: 'speech', content: '[yelling] WOW THAT IS SO SURPRISING TO ME!', audioTag: 'yelling', emoji: '😲' },
    ...Array.from({ length: 24 }, (_, i) => ({
      id: 13 + i,
      label: `Button ${13 + i}`,
      type: 'speech',
      content: 'Empty button',
      audioTag: '',
      emoji: '🔘'
    }))
  ],
  needs: [
    { id: 1, label: 'Can you turn on more lights please', type: 'speech', content: '[cheerful] Can you turn on more lights please', audioTag: 'cheerful', emoji: '💡' },
    { id: 2, label: 'Can you please dim the lights', type: 'speech', content: '[whispering] Can you please dim the lights for me', audioTag: 'whispering', emoji: '🌙' },
    { id: 3, label: 'I REALLY NEED A WARM BLANKET!', type: 'speech', content: '[yelling] I REALLY NEED A WARM BLANKET RIGHT NOW!', audioTag: 'yelling', emoji: '🛏️' },
    { id: 4, label: 'I need another soft pillow', type: 'speech', content: '[sighing] I need another soft pillow for my head', audioTag: 'sighing', emoji: '🛌' },
    { id: 5, label: 'This area needs to be cleaned up', type: 'speech', content: '[calmly] This area really needs to be cleaned up', audioTag: 'calmly', emoji: '🧹' },
    { id: 6, label: 'Can we get some fresh air in here', type: 'speech', content: '[cheerful] Can we get some fresh air in here please', audioTag: 'cheerful', emoji: '🌬️' },
    { id: 7, label: 'I need some private time please', type: 'speech', content: '[nervously] I need some private time please', audioTag: 'nervously', emoji: '🚪' },
    { id: 8, label: 'Can I please use the telephone', type: 'speech', content: '[excited] Can I please use the telephone to call someone', audioTag: 'excited', emoji: '📞' },
    { id: 9, label: 'Can you bring me a good book', type: 'speech', content: '[cheerful] Can you bring me a good book to read', audioTag: 'cheerful', emoji: '📚' },
    { id: 10, label: 'WHERE ARE MY GLASSES?!', type: 'speech', content: '[screaming] WHERE ARE MY GLASSES? I CANNOT SEE!', audioTag: 'screaming', emoji: '👓' },
    { id: 11, label: 'I would love to do some exercise', type: 'speech', content: '[singing] I would love to do some exercise today', audioTag: 'singing', emoji: '🏃' },
    { id: 12, label: 'I would really enjoy a relaxing massage', type: 'speech', content: '[cheerful] I would really enjoy a relaxing massage', audioTag: 'cheerful', emoji: '💆' },
    ...Array.from({ length: 24 }, (_, i) => ({
      id: 13 + i,
      label: `Button ${13 + i}`,
      type: 'speech',
      content: 'Empty button',
      audioTag: '',
      emoji: '🔘'
    }))
  ],
  responses: [
    { id: 1, label: 'Okay, that sounds good to me', type: 'speech', content: '[cheerful] Okay, that sounds good to me', audioTag: 'cheerful', emoji: '👍' },
    { id: 2, label: 'Maybe we could try that', type: 'speech', content: '[calmly] Maybe we could try that approach', audioTag: 'calmly', emoji: '🤷' },
    { id: 3, label: 'I honestly do not know the answer', type: 'speech', content: '[sighing] I honestly do not know the answer to that', audioTag: 'sighing', emoji: '🤔' },
    { id: 4, label: 'That is a really great idea', type: 'speech', content: '[excited] That is a really great idea!', audioTag: 'excited', emoji: '💡' },
    { id: 5, label: 'I do not think that is wise', type: 'speech', content: '[nervously] I do not think that is a wise decision', audioTag: 'nervously', emoji: '❌' },
    { id: 6, label: 'Can we please do this later', type: 'speech', content: '[whispering] Can we please do this later instead', audioTag: 'whispering', emoji: '⏰' },
    { id: 7, label: 'WE NEED TO DO THIS RIGHT NOW!', type: 'speech', content: '[yelling] WE NEED TO DO THIS RIGHT NOW!', audioTag: 'yelling', emoji: '⚡' },
    { id: 8, label: 'I am completely finished with this', type: 'speech', content: '[cheerful] I am completely finished with this task', audioTag: 'cheerful', emoji: '✅' },
    { id: 9, label: 'I am not ready for this yet', type: 'speech', content: '[nervously] I am not ready for this yet', audioTag: 'nervously', emoji: '⏳' },
    { id: 10, label: 'CAN YOU REPEAT THAT PLEASE!', type: 'speech', content: '[screaming] CAN YOU REPEAT THAT PLEASE! I DID NOT HEAR YOU!', audioTag: 'screaming', emoji: '🔄' },
    { id: 11, label: 'You are going way too fast for me', type: 'speech', content: '[coughing] You are going way too fast for me to follow', audioTag: 'coughing', emoji: '🐌' },
    { id: 12, label: 'That is absolutely perfect', type: 'speech', content: '[laughing loud] That is absolutely perfect!', audioTag: 'laughing loud', emoji: '🌟' },
    ...Array.from({ length: 24 }, (_, i) => ({
      id: 13 + i,
      label: `Button ${13 + i}`,
      type: 'speech',
      content: 'Empty button',
      audioTag: '',
      emoji: '🔘'
    }))
  ],
  fun: [
    { id: 1, label: 'Please tell me a really funny joke', type: 'speech', content: '[laughing loud] Please tell me a really funny joke that will make me laugh', audioTag: 'laughing loud', emoji: '😄' },
    { id: 2, label: 'I would love to hear a story', type: 'speech', content: '[cheerful] I would love to hear an interesting story', audioTag: 'cheerful', emoji: '📚' },
    { id: 3, label: 'Play some upbeat happy music', type: 'music', content: 'upbeat happy energetic song with drums', audioTag: '', emoji: '🎵', duration: 30 },
    { id: 4, label: 'LET US PLAY AN EXCITING GAME!', type: 'speech', content: '[screaming] LET US PLAY AN EXCITING GAME TOGETHER!', audioTag: 'screaming', emoji: '🎮' },
    { id: 5, label: 'I want to dance and move around', type: 'speech', content: '[singing] I want to dance and move around to the music', audioTag: 'singing', emoji: '💃' },
    { id: 6, label: 'WE SHOULD CELEBRATE THIS MOMENT!', type: 'speech', content: '[yelling] WE SHOULD CELEBRATE THIS SPECIAL MOMENT!', audioTag: 'yelling', emoji: '🎉' },
    { id: 7, label: 'I have a wonderful surprise for you', type: 'speech', content: '[excited] I have a wonderful surprise for you today', audioTag: 'excited', emoji: '🎁' },
    { id: 8, label: 'Let us have the best party ever', type: 'speech', content: '[laughing loud] Let us have the best party ever with everyone', audioTag: 'laughing loud', emoji: '🎊' },
    { id: 9, label: 'Infectious laughter and giggles', type: 'sound_effect', content: 'infectious happy laughter and giggles that make you smile', audioTag: '', emoji: '😂' },
    { id: 10, label: 'Thunderous applause and cheering', type: 'sound_effect', content: 'thunderous applause and enthusiastic cheering from a crowd', audioTag: '', emoji: '👏' },
    { id: 11, label: 'Cheerful melodic whistling tune', type: 'sound_effect', content: 'cheerful melodic whistling tune that is uplifting', audioTag: '', emoji: '🎵' },
    { id: 12, label: 'Excited crowd cheering loudly', type: 'sound_effect', content: 'excited crowd cheering loudly and celebrating victory', audioTag: '', emoji: '📢' },
    ...Array.from({ length: 24 }, (_, i) => ({
      id: 13 + i,
      label: `Button ${13 + i}`,
      type: 'speech',
      content: 'Empty button',
      audioTag: '',
      emoji: '🔘'
    }))
  ]
};

// ElevenLabs API configuration
export const ELEVENLABS_CONFIG = {
  baseUrl: 'https://api.elevenlabs.io/v1',
  endpoints: {
    tts: '/text-to-speech',
    soundEffects: '/sound-generation',
    music: '/music'
  },
  defaultVoice: 'default',
  audioFormats: ['mp3', 'wav'],
  maxSoundDuration: 30,
  minSoundDuration: 0.5
};

// Grid size options
export const GRID_SIZES = [
  { value: 4, label: '4x4' },
  { value: 5, label: '5x5' },
  { value: 6, label: '6x6' }
];

// Audio quality options
export const AUDIO_QUALITIES = [
  { value: 'low', label: 'Low Quality' },
  { value: 'medium', label: 'Medium Quality' },
  { value: 'high', label: 'High Quality' },
  { value: 'highest', label: 'Highest Quality' }
];