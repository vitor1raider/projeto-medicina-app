import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'

interface ArticleContentProps {
  html: string
}

export default function ArticleContent({ html }: ArticleContentProps) {
  if (Platform.OS === 'web') {
    return React.createElement('iframe', {
      srcDoc: html,
      style: { border: 'none', width: '100%', minHeight: 300 },
    })
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={styles.webview}
      scrollEnabled={false}
    />
  )
}

const styles = StyleSheet.create({
  webview: {
    minHeight: 300,
    backgroundColor: 'transparent',
  },
})
