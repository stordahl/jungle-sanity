<script>
	const QUERY = `
		query {
			post( slug: "test-post-2" ) {
				title
				slug
				body {
					children {
						text
					}
				}
			}
		}
	`;
	const QUERYRES = {};
	
	const QUERYPARAMOPTS = `
		query {
			posts {
				slug
			}
		}
	`;

	import Nav from "../../components/Nav.svelte";
</script>

<Nav page="{`/blog/${QUERYRES.post.slug}/`}"/>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
    }
    
	ul {
		margin: 0 0 1em 0;
		line-height: 1.5;
    }

</style>

<svelte:head>
	<title>Blog - {QUERYRES.post.title}</title>
</svelte:head>

<main>
	<ul>
			<h1>{QUERYRES.post.title}</h1>
		<!-- {#each QUERYRES.post.body as { children }}
			{#each children as { text }}
				<p>{ text }</p>
			{/each}
		{/each} -->
	</ul>
</main>