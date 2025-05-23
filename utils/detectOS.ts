export const detectOS = (): 'mac' | 'windows' => {
  const ua = window.navigator.userAgent;
  return ua.includes('Mac') ? 'mac' : 'windows';
};