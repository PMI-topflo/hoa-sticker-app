import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === 'my_verify_token') {
    return new Response(challenge || '', { status: 200 })
  }

  return new Response('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  console.log('Incoming message:', JSON.stringify(body, null, 2))

  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]

  if (!message) {
    console.log('No inbound message found in payload')
    return NextResponse.json({ status: 'no message' })
  }

  const from = message.from
  const text = message.text?.body

  console.log('From:', from)
  console.log('Text:', text)

  const response = await fetch(
    'https://graph.facebook.com/v18.0/1052869794579826/messages',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer EAAXe9BE7rZCcBRPmAQefDw5wDEjJQrnlCz7ANm0SEoprHV39CsTvXNadqLUGHBQED7l1WOdfPZAfm7ppZAy9JNZCz2rjusMIQkhZAMD8g7YShb65G7SUMoAU8hIbRmx1rQZCug6l0ZAAXCJ9wBtyZAUPE39kgkwrt6tIm0KomcZAUVLjmcJRWjlagkXZAUVmkrVFE3so4Homn1ZBwwXOw7zqoZBYZASBA0wmRtsNJu9JNTwjqHHhgLeF5B6Kqm9TgKhZBnLYmjZC0ZAnIjStpCwg5uGfWz6WPqZB3P40VqIUZD',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: from,
        text: { body: 'Received your message 👍' },
      }),
    }
  )

  const responseText = await response.text()
  console.log('WhatsApp send status:', response.status)
  console.log('WhatsApp send response:', responseText)

  return NextResponse.json({ status: 'replied_attempted' })
}