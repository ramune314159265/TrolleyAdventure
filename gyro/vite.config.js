import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
	base: './',
	plugins: [
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			manifest: {
				name: 'シンクロナイズドスペーシャルハイウェイ ジャイロ',
				short_name: 'SSHジャイロ',
				description: 'SSH スマホで傾き検知',
				theme_color: '#000',
				display: 'fullscreen',
				lang: 'ja-jp',
				orientation: 'landscape-primary',
				icons: [
					{
						src: 'icon_144.png',
						sizes: '144x144',
						type: 'image/png'
					}
				]
			},
		})
	],
})
