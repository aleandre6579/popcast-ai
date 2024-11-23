import React from 'react'
import { Layout, Button } from 'antd'

const { Header } = Layout

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <Header className='bg-white flex justify-end items-end'>
      <span className='bg-white text-white'>PopcastAI</span>
      <Button type='primary'>Sign In</Button>
    </Header>
  )
}

export default Navbar
