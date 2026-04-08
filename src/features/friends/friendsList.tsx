import { Edit2, Trash2 } from 'lucide-react'
import { type Friend } from '../../types/friend'
import { Button } from '../../components/layout/button'
import { EmptyState } from '../../components/layout/emptyState'

interface FriendsListProps {
  friends: Friend[]
  onEdit: (friend: Friend) => void
  onDelete: (id: string) => void
}

const avatarColors = ['#00ADB5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

export function FriendsList({ friends, onEdit, onDelete }: FriendsListProps) {
  if (friends.length === 0) {
    return <EmptyState icon="👫" title="No friends yet" description="Add friends to use them across loans, bills, and splits" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {friends.map((friend, i) => {
        const color = avatarColors[i % avatarColors.length]
        return (
          <div
            key={friend.id}
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${color}10 0%, rgba(57,62,70,0.5) 100%)`, border: `1px solid ${color}20` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-[#222831] shrink-0"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
              >
                {friend.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[#EEEEEE] font-semibold text-sm leading-none mb-0.5">{friend.name}</p>
                {friend.notes
                  ? <p className="text-[#EEEEEE]/35 text-xs">{friend.notes}</p>
                  : <p className="text-[#EEEEEE]/20 text-xs italic">no notes</p>
                }
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit(friend)}><Edit2 size={13} /></Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(friend.id)}><Trash2 size={13} /></Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
