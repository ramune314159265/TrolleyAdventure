export const fonts = [
	{
		name: 'mainfont',
		src: './asset/fonts/main.otf'
	}
]

export const assetManifest = {
	bundles: [
		{
			name: 'first_load',
			assets: [
				{
					alias: 'mainfont',
					src: './asset/fonts/main.otf',
				},
			]
		},
		{
			name: 'difficult_select',
			assets: [
				{
					alias: 'background',
					src: './asset/images/nc173341_洞窟の中_ignore.png',
				}, {
					alias: 'map',
					src: './asset/images/856371_ignore.png',
				},
			]
		},
	]
}
