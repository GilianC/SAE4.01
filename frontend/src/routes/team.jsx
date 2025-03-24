import Team from "../ui/Team";
import Testimonial from "../ui/Testimonial";

import TeamSkeleton from "../ui/Team/TeamSkeleton";
import { fetchTestimonialData } from "../lib/loaders";
import { fetchOurTeams } from "../lib/loaders";
import { useLoaderData, defer, Await } from "react-router-dom";
import { Suspense } from "react";
export async function loader({ params }) {
    const TeamData =  fetchOurTeams(params.teamsType );
    const TestimonialData = await fetchTestimonialData(params.teamsType);
    return defer ({team : TeamData, testimonial: TestimonialData});

}


export default function OurTeam(){
    const data= useLoaderData();
    console.log(data.team);
    return (
        <>
        <Suspense fallback={<TeamSkeleton/>}>
        <Await resolve={data.team}  errorElement={<div>"Failed to load"</div>}>
            {TeamData => <Team {...TeamData}/>}
  
            </Await>
            </Suspense>
            <Testimonial data={data.testimonial}/>
        </>
    );
}