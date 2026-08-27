import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './routes/Login'
import ArticlesList from './routes/ArticlesList'
import ArticleEditor from './routes/ArticleEditor'
import RequireAdmin from './components/RequireAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/articles"
          element={
            <RequireAdmin>
              <ArticlesList />
            </RequireAdmin>
          }
        />
        <Route
          path="/articles/new"
          element={
            <RequireAdmin>
              <ArticleEditor />
            </RequireAdmin>
          }
        />
        <Route
          path="/articles/:id"
          element={
            <RequireAdmin>
              <ArticleEditor />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/articles" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
