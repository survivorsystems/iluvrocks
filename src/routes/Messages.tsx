import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Mail, Send, UserRound } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Card, EmptyState, SectionHeader, getInitials } from '../components/ui'

export default function Messages() {
  const members = useQuery(api.chat.listMembersForMessaging, {})
  const conversations = useQuery(api.chat.listDirectConversations, {})
  const startConversation = useMutation(api.chat.startDirectConversation)
  const sendMessage = useMutation(api.chat.sendDirectMessage)
  const [activeConversationId, setActiveConversationId] =
    useState<Id<'directConversations'> | null>(null)
  const [messageText, setMessageText] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const activeConversation =
    conversations?.find(
      (conversation) => conversation._id === activeConversationId,
    ) ?? null
  const messages = useQuery(
    api.chat.listDirectMessages,
    activeConversationId ? { conversationId: activeConversationId } : 'skip',
  )

  const sortedMembers = useMemo(
    () =>
      [...(members ?? [])].sort((first, second) =>
        getMemberName(first).localeCompare(getMemberName(second)),
      ),
    [members],
  )

  const handleStartConversation = async (recipientId: Id<'users'>) => {
    setStatus(null)
    try {
      const conversationId = await startConversation({ recipientId })
      setActiveConversationId(conversationId)
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Conversation could not be started.',
      )
    }
  }

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeConversationId || !messageText.trim()) return

    setStatus(null)
    try {
      await sendMessage({
        conversationId: activeConversationId,
        text: messageText,
      })
      setMessageText('')
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Message could not be sent.',
      )
    }
  }

  return (
    <section className="workspace-page">
      <SectionHeader
        eyebrow="Messages"
        title="Direct messages"
        description="Start simple one-to-one conversations with other iluvrocks members."
      />

      <div className="messages-layout">
        <Card className="messages-sidebar">
          <h2>Conversations</h2>
          {conversations === undefined ? (
            <p className="empty-state">Loading conversations...</p>
          ) : null}
          {conversations?.length === 0 ? (
            <p className="messages-note">
              No conversations yet. Choose a member below to start one.
            </p>
          ) : null}
          <div className="conversation-list">
            {conversations?.map((conversation) => (
              <button
                key={conversation._id}
                type="button"
                className={
                  conversation._id === activeConversationId
                    ? 'is-active'
                    : undefined
                }
                onClick={() => setActiveConversationId(conversation._id)}
              >
                <Avatar
                  label={getMemberName(conversation.otherUser)}
                  image={conversation.otherUser?.image}
                />
                <span>
                  <strong>{getMemberName(conversation.otherUser)}</strong>
                  <em>{conversation.lastMessageText || 'No messages yet'}</em>
                </span>
              </button>
            ))}
          </div>

          <h2>Members</h2>
          <div className="member-message-list">
            {sortedMembers.map((member) => (
              <button
                key={member._id}
                type="button"
                onClick={() => void handleStartConversation(member._id)}
              >
                <Avatar label={getMemberName(member)} image={member.image} />
                <span>
                  <strong>{getMemberName(member)}</strong>
                  <em>
                    {member.location || member.email || 'iluvrocks member'}
                  </em>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="message-thread-card">
          {activeConversation ? (
            <>
              <header className="message-thread-header">
                <Avatar
                  label={getMemberName(activeConversation.otherUser)}
                  image={activeConversation.otherUser?.image}
                />
                <div>
                  <p className="eyebrow">Conversation</p>
                  <h2>{getMemberName(activeConversation.otherUser)}</h2>
                </div>
              </header>

              <div className="message-thread">
                {messages === undefined ? (
                  <p className="messages-note">Loading messages...</p>
                ) : null}
                {messages?.length === 0 ? (
                  <EmptyState
                    title="No messages yet"
                    description="Send the first note to get the conversation started."
                  />
                ) : null}
                {messages?.map((message) => (
                  <article
                    key={message._id}
                    className={
                      message.isMine
                        ? 'message-bubble is-mine'
                        : 'message-bubble'
                    }
                  >
                    <p>{message.text}</p>
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                  </article>
                ))}
              </div>

              <form className="message-composer" onSubmit={handleSendMessage}>
                <label>
                  <span className="sr-only">Message</span>
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Write a message..."
                    rows={3}
                  />
                </label>
                <button type="submit" disabled={!messageText.trim()}>
                  <Send aria-hidden="true" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <EmptyState
              title="Choose a conversation"
              description="Pick an existing conversation or start a new one from the member list."
              action={<Mail aria-hidden="true" />}
            />
          )}
          {status ? <p className="messages-status">{status}</p> : null}
        </Card>
      </div>
    </section>
  )
}

function Avatar({ label, image }: { label: string; image?: string }) {
  return (
    <span className="message-avatar" aria-hidden="true">
      {image ? <img src={image} alt="" /> : <UserRound aria-hidden="true" />}
      {!image ? <em>{getInitials(label)}</em> : null}
    </span>
  )
}

function getMemberName(
  member?: { name?: string; username?: string; email?: string } | null,
) {
  return (
    member?.name ||
    member?.username ||
    member?.email?.split('@')[0] ||
    'Rockhound member'
  )
}
