import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { initSettings } from './settings'
import './index.css'

// 初回利用時に設定の初期値を localStorage へ書き込む。
initSettings()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
