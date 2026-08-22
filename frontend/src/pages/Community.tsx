import { FormEvent, useState } from "react";
import Navbar from "../components/Navbar";

type Post = { author: string; place: string; body: string };

const initialPosts: Post[] = [
  { author: "Maya R.", place: "Swiss Alps", body: "The early train into the Bernese Oberland was the perfect start to our trip." },
  { author: "Noah K.", place: "Kyoto", body: "A quiet morning walk through the side streets was my favourite part of the city." },
];

export default function Community() {
  const [posts, setPosts] = useState(initialPosts);
  const [notice, setNotice] = useState<string | null>(null);

  function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = String(form.get("body") ?? "").trim();
    const place = String(form.get("place") ?? "").trim();
    if (!body || !place) return;
    setPosts((current) => [{ author: "You", place, body }, ...current]);
    setNotice("Your story has been added to this browser session.");
    event.currentTarget.reset();
  }

  return <main className="workspace-page"><Navbar />
    <section className="workspace-hero shell"><div><p className="eyebrow">TRAVELLERS TOGETHER</p><h1>Community</h1><p>Share a recent discovery and pick up ideas from fellow travellers.</p></div></section>
    <form className="workspace-form shell compact-form" onSubmit={publish}><h2>Share a travel note</h2><label>Place<input name="place" required placeholder="e.g. Swiss Alps" /></label><label>Your note<textarea name="body" required maxLength={600} placeholder="What made this place memorable?" /></label><button className="workspace-primary">Publish note</button></form>
    {notice && <p className="shell page-notice">{notice}</p>}
    <section className="workspace-grid shell">{posts.map((post, index) => <article className="trip-workspace-card" key={`${post.author}-${index}`}><p className="eyebrow">{post.place}</p><h2>{post.author}</h2><p>{post.body}</p></article>)}</section>
  </main>;
}
