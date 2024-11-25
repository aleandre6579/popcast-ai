import React from 'react'
import { Layout, Button } from 'antd'
import { PinterestOutlined, UserOutlined } from '@ant-design/icons'

const { Header } = Layout

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <Header className='flex p-4 h-auto items-center bg-transparent'>
      <button className='w-auto focus:outline-none text-black-400 text-xl font-extrabold border-none outline-none'>PopcastAI</button>
      <Button className='ml-auto outline-none focus:outline-none' icon={<UserOutlined />} variant='outlined' shape='round'>Sign In</Button>
    </Header>
  )
}

export default Navbar
