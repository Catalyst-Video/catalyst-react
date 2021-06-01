import React from 'react';

export function setThemeColor(color: string): void {
  var themeColor: string;
  switch (color) {
    case 'pink':
      themeColor = '#D53F8C';
      break;
    case 'red':
      themeColor = '#E53E3E';
      break;
    case 'orange':
      themeColor = '#DD6B20';
      break;
    case 'yellow':
      themeColor = '#FFCE26';
      break;
    case 'green':
      themeColor = '#38A169';
      break;
    case 'teal':
      themeColor = '#319795';
      break;
    case 'blue':
      themeColor = '#3f83f8';
      break;
    case 'indigo':
      themeColor = '#5A67D8';
      break;
    case 'purple':
      themeColor = '#805AD5';
      break;
    default:
      themeColor = color;
  }
  var style = document.createElement('style');
  document.head.appendChild(style);
  style.sheet?.insertRule(`:root { --themeColor: ${themeColor}}`);
}
