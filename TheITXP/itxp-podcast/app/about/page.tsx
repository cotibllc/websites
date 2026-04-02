import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">About The IT XP</h1>
      <div className="prose prose-gray max-w-none">
        <p>
          This is the home of the The IT XP, a show dedicated to the world of Information Technology
          and the professionals working to drive business initiatives using their technology skills.
          Whether you are a developer or a systems administrator, if you&apos;re using &ldquo;The
          Cloud&rdquo; or hosting on-premises, we&apos;re going to provide you with some nuggets of
          insight on what happens behind the curtain of an organization&apos;s IT department.
        </p>
        <p>
          The term Information Technology is an umbrella term covering a wide array of technologies
          and job functions. You may not be working in a formal IT department, but when we pull back
          the layers, most in your organization will call you IT; obviously this isn&apos;t a blanket
          statement, but one that identifies technology professionals outside of true technology
          firms. Let&apos;s be realistic, even the large tech firms have an IT department. Hell, I
          bet your mom thinks you just fix computers. Meanwhile you&apos;re probably writing some of
          the best code on Github!
        </p>
        <p>
          Whether you are a helpdesk agent, developer, project manager, cybersec analyst, dba or any
          other title that puts you in the umbrella of Information Technology, then this show is for
          you.
        </p>
        <p>
          We pull back the curtain and expose some of the inner workings of what it&apos;s like to
          work in Information Technology.
        </p>
      </div>
    </div>
  );
}
