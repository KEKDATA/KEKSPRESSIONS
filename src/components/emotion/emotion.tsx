import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const emojiMap = {
  angry: '🤬',
  fear: '😱',
  disgust: '🤢',
  happy: '😀',
  neutral: '😐',
  sad: '😢',
  surprise: '😮',
};

const nameMap = {
  [emojiMap.angry]: 'Гнев',
  [emojiMap.fear]: 'Страх',
  [emojiMap.disgust]: 'Отвращение',
  [emojiMap.happy]: 'Радость',
  [emojiMap.neutral]: 'Нейтральное выражение',
  [emojiMap.sad]: 'Печаль',
  [emojiMap.surprise]: 'Удивление',
};

export type EmotionProps = {
  type: keyof typeof emojiMap;
  conf: number;
};

function getOpacity(conf: number) {
  if (conf < 0.25) {
    return 0;
  }
  if (conf < 0.5) {
    return 0.5;
  }
  if (conf < 0.8) {
    return 0.8;
  }

  return 1;
}

const useStyles = makeStyles<undefined, { opacity: number }>({
  root: {
    fontSize: '1.5rem',
    opacity: ({ opacity }) => opacity,
  },
});

function Emotion({ type, conf }: EmotionProps) {
  const classes = useStyles({ opacity: getOpacity(conf) });
  const emoji = emojiMap[type];

  return (
    <div className={classes.root}>
      <span>{emoji}</span>
      <span>{` ${nameMap[emoji]}`}</span>
    </div>
  );
}

export default Emotion;
