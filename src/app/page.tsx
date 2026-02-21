import SearchableContent from '@/components/SearchableContent';
import { getMembers, getConnections } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const members = await getMembers();
  const connections = getConnections(members);

  return <SearchableContent members={members} connections={connections} />;
}
