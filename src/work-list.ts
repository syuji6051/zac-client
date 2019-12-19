export enum workDiv {
  normalWork = '1',
  markingWork = '2',
  systemManagement = '4',
  meeting = '5',
  troubleWork = '6',
  holiday = '27',
  bscDevelop = '29',
  bscMaintenance = '30',
  preOrderWork = '32'
}

export const workList = [
  { code: '999991', workDiv: workDiv.preOrderWork },
  { code: '999992', workDiv: workDiv.markingWork },
  { code: '999993', workDiv: workDiv.troubleWork },
  { code: '999994', workDiv: workDiv.systemManagement },
  { code: '999995', workDiv: workDiv.bscDevelop },
  { code: '999996', workDiv: workDiv.bscMaintenance },
  { code: '999997', workDiv: workDiv.markingWork },
  { code: '999998', workDiv: workDiv.holiday }
];
