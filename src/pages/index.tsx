import Head from 'next/head'
import { Crossword } from '@/components/crossword'

export default function Home() {
  return (
    <>
      <Head>
      </Head>
      <main>
        <Crossword schema={{ gridSize: [3, 3] }} />
      </main>
    </>
  )
}
