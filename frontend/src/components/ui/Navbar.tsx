import React from 'react'
import { Layout, Button } from 'antd'

const { Header } = Layout

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <Header className='flex justify-between items-center'>
      <span className='text-red-400 font-bold'>PopcastAI</span>
      <Button type='primary'>Sign In</Button>
    </Header>
  )
}

export default Navbar
