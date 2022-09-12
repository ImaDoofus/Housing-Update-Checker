import { load } from 'cheerio';
import Parser from 'rss-parser';
import { parse } from 'yaml';
import fs from 'fs';

let tokens = parse(fs.readFileSync('./tokens.yml', 'utf8'));

let parser = new Parser();

async function alertHousingUpdate(post) {
	let rawData = await fetch(post.link).then(res => res.text());

	let $ = load(rawData);
	let postData = $('.bbWrapper')[0];

	$(postData).find('script').remove();

	let postImage = $(postData).find('.bbImage');
	let imageSource = $(postImage).attr('src');
	
	let summary = '**Summary**\n';
	$(postData).find('span[style*=24px]').each((i, e) => summary += '• ' + $(e).text() + '\n');

	for (let i = 0; i < tokens.webhooks.length; i++) {
		let webhook = tokens.webhooks[i];
		await fetch(webhook.url, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: JSON.stringify({
				username: 'Housing Update Pinger',
				avatar_url: 'https://cdn.discordapp.com/avatars/384695177366732800/30040872b7d91a2f09e76803c89779c2.webp?size=64',
				content: webhook.message,
				embeds: [{
					title: post.title,
					url: post.link,
					description: summary,
					image: { url: imageSource },
					thumbnail: { url: 'https://i.imgur.com/Y3VP3Wa.gif' },
					footer: { text: 'by ImaDoofus :)' },
					color: 2550450,
				}]
			})
		})
	}

	process.exit();
}

async function checkHousingUpdate() {
	try {
		let feed = await parser.parseURL('https://hypixel.net/forums/4/index.rss');
		if (!feed.items[0].title.includes('Housing')) return;
		if (feed.items[0].creator !== 'ConnorLinfoot') return;
		switch (feed.items[0].title) {
			// make sure old forum posts don't trigger the bot
			case 'Housing Update - Conditions, Item Actions, and more!': return;
			case 'Housing Update - Scoreboard Editor, Event Actions, Local Stats, and more!': return;
			case 'Housing - New Plot Size, Custom NPCs, Item Editor, and more!': return;
			case 'Housing - Custom Groups, Action Improvements, Audit Logs and More': return;
			case 'Housing - Regions, Actions, Better Pro Tools + More': return;
			case 'Housing Update - Multiple Houses, New Lobby, New Themes + More!': return;
		}
		alertHousingUpdate(feed.items[0]);
	} catch (err) {
		console.log(err)
	}
}

checkHousingUpdate();
setInterval(async () => {
	await checkHousingUpdate();
}, 1000 * 30)