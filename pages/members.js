import { getMarkdown } from 'lib/markdown'

import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Members({ markdown }) {
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

  if (!session.user.isSubscriber) {
    router.push('/join')
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

        <div
          className='markdown'
          dangerouslySetInnerHTML={{ __html: markdown }}
        />
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const markdown = await getMarkdown()

  return {
    props: {
      markdown,
    },
  }
}
