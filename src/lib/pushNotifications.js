import { requestBackend } from './backendApi'

function decodeBase64Url(value) {
  const padded = `${value}${'='.repeat((4 - value.length % 4) % 4)}`
  const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(decoded, character => character.charCodeAt(0))
}

export async function enablePushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Push notifications are not supported by this browser.')
  }
  if (!window.isSecureContext) {
    throw new Error('Push notifications require HTTPS. Use localhost for local testing.')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notifications are blocked. Allow them in your browser or phone settings, then try again.')
  }

  const { public_key: publicKey } = await requestBackend('notifications/push-public-key')
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeBase64Url(publicKey),
  })

  await requestBackend('notifications/push-subscription', {
    method: 'POST',
    body: subscription.toJSON(),
  })

  return subscription
}
