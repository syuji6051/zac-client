export const WorkDiv = {
  normalWork: '1',
  markingWork: '2',
  systemManagement: '4',
  meeting: '5',
  troubleWork: '6',
  holiday: '27',
  bscDevelop: '29',
  bscMaintenance: '30',
  preOrderWork: '32',
};

export const workList = [
  { code: '999991', workDiv: WorkDiv.preOrderWork },
  { code: '999992', workDiv: WorkDiv.markingWork },
  { code: '999993', workDiv: WorkDiv.troubleWork },
  { code: '999994', workDiv: WorkDiv.systemManagement },
  { code: '999995', workDiv: WorkDiv.bscDevelop },
  { code: '999996', workDiv: WorkDiv.bscMaintenance },
  { code: '999997', workDiv: WorkDiv.meeting },
  { code: '999998', workDiv: WorkDiv.holiday },
];
