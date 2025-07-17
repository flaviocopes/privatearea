import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  const { data: session, status } = useSession()

  const loading = status === 'loading'

  if (loading) {
    return null
  }

  if (session) {
    router.push('/members')
    return
  }

  return (
    <div>
      <Head>
        <title>Private Area</title>
        <meta name='description' content='Private Area' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='text-center '>
        <h1 className=' mt-20 font-extrabold text-2xl'>Private Area</h1>

        <p className='mt-10'>Join the private area to have access to</p>

        <ol className='mt-10 list-inside list-decimal'>
          <li>The lyrics book in PDF</li>
          <li>Exclusive 30% discount on the albums</li>
          <li>Exclusive access to preorders</li>
        </ol>

        <p className='mt-10'>Just $5/m</p>

        <div className='mt-10'>
          <a className='bg-black text-white px-5 py-2' href='/api/auth/signin'>
            Become a supporter
          </a>
        </div>
      </div>
    </div>
  )
}
