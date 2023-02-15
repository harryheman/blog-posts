import Tree from './components/Tree'

const data = {
  name: 'Frontend',
  children: [
    {
      name: 'Internet',
      children: [
        {
          name: 'How does the internet work?',
        },
        {
          name: 'What is HTTP?',
        },
        {
          name: 'Browsers and how they work?',
        },
        {
          name: 'DNS and how it works?',
        },
        {
          name: 'What is domain name?',
        },
        {
          name: 'What is hosting?',
          // children: [{ name: 'test' }, { name: 'test2' }, { name: 'test3' }],
        },
      ],
    },
    {
      name: 'HTML',
      children: [
        {
          name: 'Learn the basics',
        },
        {
          name: 'Writing Semantic HTML',
        },
        {
          name: 'Forms and Validations',
        },
        {
          name: 'Conventions and Best Practices',
        },
        {
          name: 'Accessibility',
        },
        {
          name: 'SEO basics',
        },
      ],
    },
  ],
}

export default function App() {
  return (
    <Tree
      data={data}
      height={512}
      gProps={{
        onClick: (e: React.MouseEvent) => {
          const target = e.target as SVGElement
          console.log(target.parentElement)
        },
      }}
    />
  )
}
