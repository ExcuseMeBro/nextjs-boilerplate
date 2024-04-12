"use client"
import {Button} from "@/components/ui/button";
import {gql, useQuery} from "@apollo/client";

export default function Home() {
  const {data, loading, error} = useQuery(gql`
    {
      user(id: 1) {
        id
        name
      }
    }
  `)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button>Click me!</Button>
      {loading && <p>Loading...</p>}
      {error && <p>Error</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </main>
  );
}
