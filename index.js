import Parser from 'rss-parser'
const parser = new Parser()
import imgbbUploader from 'imgbb-uploader';

import captureWebsite from 'capture-website';

const accountSid = 'ACe0f5f9b23a14366fa55626345035e577';
const authToken = '4716ae7619586314099bae7b86617df9';
import Twilio from 'twilio'
const client = Twilio(accountSid, authToken);

async function alertHousingUpdate(feed) {
	// alert me first priority
	await client.messages
		.create({
			body: `HOUSING WAS UPDATE ${feed.items[0].link}`,
			to: '+13853496686', // Text this number
			from: '+19379362187', // From a valid Twilio number
		})

	// capture image and save as screenshot.png
	await captureWebsite.file(feed.items[0].link, 'screenshot.jpeg', {
		scrollToElement: '.p-body-content',
		height: 2000,
		type: 'jpeg',
		quality: 1,
	});

	// upload image to imgbb
	const imgbb = await imgbbUploader("e3bd529add712a561fa1da99e6120baf", "screenshot.jpeg")

	// send discord message
	// https://discord.com/api/webhooks/975237334628978738/qv8C_i9hAn_7_6zBR3bu5ddx6kUNN1pWlePgxajx_KnFLR_o25lYtq-35eQuss6wfTVO // my disc
	// https://discord.com/api/webhooks/975409100064182312/oRxQUHll7WpTMeGJUnPosQ3RZdqSnzekD_-4rMcOczTXl9DYb9CmCPYIxpOKkIxNmbBM // speedwarp disc
	var webhookURL = 'https://discord.com/api/webhooks/975409100064182312/oRxQUHll7WpTMeGJUnPosQ3RZdqSnzekD_-4rMcOczTXl9DYb9CmCPYIxpOKkIxNmbBM'
	const res = await fetch(webhookURL, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify({
			username: 'Housing Update Checker',
			avatar_url: 'https://cdn.discordapp.com/avatars/384695177366732800/30040872b7d91a2f09e76803c89779c2.webp?size=64',
			content: `@everyone The Housing Update is here!\nCheck it out: ${feed.items[0].link}`,
		})
	})

	const res2 = await fetch(webhookURL, {
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify({
			username: 'Housing Update Checker',
			avatar_url: 'https://cdn.discordapp.com/avatars/384695177366732800/30040872b7d91a2f09e76803c89779c2.webp?size=64',
			content: `Here is a render of the post: ${imgbb.display_url}`,
		})
	})

	process.exit() // end process

}

const ping = setInterval(async () => {
	try {
		const feed = await parser.parseURL('https://hypixel.net/forums/news-and-announcements.4/index.rss')
		console.log(feed.items[0].title)
		if (feed.items[0].title.includes('Housing')) {
			console.log('HOUSING UPDATED')
			clearInterval(ping)
			alertHousingUpdate(feed)
		}
	} catch (err) {
		console.log(err)
	}
}, 1000 * 20) // every 20 seconds