export const fonts = [
	{
		name: 'mainfont',
		src: './fonts/main.otf'
	}
]

export const assetManifest = {
	bundles: [
		{
			name: 'first_load',
			assets: [
				{
					alias: 'mainfont',
					src: './fonts/main.otf',
				},
			]
		},
		{
			name: 'difficult_select',
			assets: [
				{
					alias: 'background',
					src: './images/nc173341_洞窟の中_ignore.png',
				}, {
					alias: 'map',
					src: './images/856371_ignore.png',
				},
			]
		},
	]
}
