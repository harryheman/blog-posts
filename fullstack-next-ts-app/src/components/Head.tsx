import Head from 'next/head'

type Props = {
  title: string
  description: string
  children?: JSX.Element
}

export default function CustomHead({ title, description, children }: Props) {
  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      {children}
    </Head>
  )
}
