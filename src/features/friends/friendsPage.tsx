import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { PageContainer } from '../../components/ui/pageContainer'
import { Navbar } from '../../components/ui/navbar'
import { Button } from '../../components/layout/button'
import { Modal } from '../../components/layout/modal'
import { FriendsForm } from './friendsForm'
import { FriendsList } from './friendsList'
import { useFriends } from '../../hooks/useFriends'
import { type Friend } from '../../types/friend'

export function FriendsPage() {
  const { friends, addFriend, updateFriend, deleteFriend } = useFriends()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Friend | null>(null)

  const handleClose = () => { setShowModal(false); setEditing(null) }

  return (
    <PageContainer>
      <Navbar title="Friends" action={<Button onClick={() => setShowModal(true)}><Plus size={15} /> Add Friend</Button>} />
      <p className="text-[#EEEEEE]/30 text-sm -mt-4 mb-6">Your go-to people for splitting everything.</p>

      {/* friend count stat */}
      <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ background: 'linear-gradient(145deg, rgba(0,173,181,0.12) 0%, rgba(57,62,70,0.5) 100%)', border: '1px solid rgba(0,173,181,0.15)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,173,181,0.15)' }}>
          <Users size={22} className="text-[#00ADB5]" />
        </div>
        <div>
          <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-3xl font-extrabold text-[#00ADB5] leading-none">{friends.length}</p>
          <p className="text-[#EEEEEE]/40 text-xs mt-0.5">{friends.length === 1 ? 'friend saved' : 'friends saved'}</p>
        </div>
      </div>

      <FriendsList
        friends={friends}
        onEdit={(f) => { setEditing(f); setShowModal(true) }}
        onDelete={deleteFriend}
      />

      <Modal isOpen={showModal} onClose={handleClose} title={editing ? 'Edit Friend' : 'Add Friend'}>
        <FriendsForm
          initial={editing ?? undefined}
          onSubmit={(name, notes) => {
            if (editing) updateFriend(editing.id, name, notes)
            else addFriend(name, notes)
            handleClose()
          }}
          onCancel={handleClose}
        />
      </Modal>
    </PageContainer>
  )
}
