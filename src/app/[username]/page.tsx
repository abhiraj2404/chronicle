import { ProfileContent } from '@/components/profile/profile-content'

interface Props {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: Props) {
  const username = (await params).username

  return (
    <div className="px-4 py-4">
      <ProfileContent username={username} />
    </div>
  )
}
