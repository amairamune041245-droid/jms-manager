/**
 * Skill icons are the client images hosted by MapleStory Wiki.
 * KMS skill tools show this same art. The files stay on that host.
 */
export function wikiSkillIcon(fileName: string): string {
  return `https://media.maplestorywiki.net/yetidb/${fileName.split(' ').join('_')}`
}
