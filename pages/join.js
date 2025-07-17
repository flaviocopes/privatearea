import Script from 'next/script'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Join() {
  const router = useRouter()

  const { data: session, status } = useSession()

  const loading = status === 'loading'

  if (loading) {
    return null
  }

  if (!session) {
    router.push('/')
    return
  }

  if (session.user.isSubscriber) {
    router.push('/members')
    return
  }

  return (
    <div>
      <Script src='https://js.stripe.com/v3/' />

      <Head>
        <title>Private Area</title>
        <meta name='description' content='Private Area' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='text-center '>
        <h1 className=' mt-20 font-extrabold text-2xl'>Private Area</h1>

        <p className='mt-10'>Join for just $5/m</p>

        <button
          className='mt-10 bg-black text-white px-5 py-2'
          onClick={async () => {
            const res = await fetch('/api/stripe/session', {
              method: 'POST',
            })

            const data = await res.json()

            if (data.status === 'error') {
              alert(data.message)
              return
            }

            const sessionId = data.sessionId
            const stripePublicKey = data.stripePublicKey

            const stripe = Stripe(stripePublicKey)
            stripe.redirectToCheckout({
              sessionId,
            })
          }}
        >
          Create a subscription
        </button>
      </div>
    </div>
  )
}
