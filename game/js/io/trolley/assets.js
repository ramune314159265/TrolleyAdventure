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
		}, {
			name: 'difficult_select',
			assets: [
				{
					alias: 'start_static',
					src: './videos/start_static.mp4',
				}, {
					alias: 'start',
					src: './videos/start.mp4',
				}
			]
		}, {
			name: 'question',
			assets: [
				{
					alias: 'stars',
					src: './videos/stars.webm',
				}, {
					alias: 'stars_left',
					src: './videos/stars_left.webm',
				}, {
					alias: 'stars_right',
					src: './videos/stars_right.webm',
				}, {
					alias: 'a',
					src: './videos/a.mp4',
				}, {
					alias: 'b',
					src: './videos/b.mp4',
				}, {
					alias: 'warning',
					src: './svg/warning.svg',
					data: { resolution: 2 },
				},
			]
		},
	]
}
