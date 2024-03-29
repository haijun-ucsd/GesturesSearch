/**
 * AboutPage.js
 * 
 * This file contains the entry point of the About page, which is one of the major tabs.
 * About page introduces the project and has data visualization.
 */


import React, { useState , useEffect , useRef} from 'react';
import '../components.css';
import { Slide } from 'react-reveal';

export const chartOptions = {
    scaleShowGridLines : true,
};
  

export const chartData = {
labels: ["July", "August", "September", "October", "November", "December", "January"],
datasets: [
    {
        label: "External Uploads",
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(220,220,220,1)",
        pointColor: "rgba(220,220,220,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: [0, 20, 70, 10, 20, 50, 100]
    },
    {
        label: "Internal Uploads",
        fillColor: "rgba(151,187,205,0.2)",
        strokeColor: "rgba(151,187,205,1)",
        pointColor: "rgba(151,187,205,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,1)",
        data: [100, 300, 250, 300, 520, 450, 500]
    }
]
};

var BarChartData = {
	labels: ["Mall", "Library", "Street", "Hospital", "Park", "Fair"],
	datasets: [
		{
            axis: 'y',
			label: "My First dataset",
			fillColor: "rgba(220,220,220,0.5)",
			strokeColor: "rgba(220,220,220,0.8)",
			highlightFill: "rgba(220,220,220,0.75)",
			highlightStroke: "rgba(220,220,220,1)",
			data: [365, 300, 240, 181, 156, 55]
		}
	]
};

var BarChartOptions = {
    indexAxis: 'y',
};

var RoleData = {
	labels: ["Parent", "Patient", "Staff"],
	datasets: [
		{
			label: "My First dataset",
			fillColor: "rgba(151,187,205,0.2)",
			strokeColor: "rgba(151,187,205,0.2)",
			highlightFill: "rgba(151,187,205,0.2)",
			highlightStroke: "rgba(151,187,205,0.2)",
			data: [12, 2, 6]
		}
	]
};

export default function AboutPage() {
    var LineChart = require("react-chartjs").Line;
    var VerticalBarChart = require("react-chartjs").Bar;
    var RoleBar = require("react-chartjs").Bar;
    var flare = Object({"name" : "flare",
                "children" : [{"name" : "analytics", "size" : 2},
                              {"name" : "shapes", "size" : 3}]});
    console.log(flare);

    return (
        <div className="AboutPageBox">
            {/* <div className='Home'>
                <h5>Ubi-Gesture</h5>
                <img
                    src="https://mb.cision.com/Public/14959/3307223/99660166e82b8824_800x800ar.png"
                />
            </div> */}
            <div className='HistoryTitle'>
                <h5>Total Uploads</h5>
                <h5>Most Common Sites in Uploads</h5>
            </div>
            <div className='UploadHistory'>
                <LineChart className='LineChart' data={chartData} options={chartOptions} width="800" height="350"/>
                <VerticalBarChart className='BarChart' data={BarChartData} options={BarChartOptions} width="400" height="350"/>
            </div>
            <div className='Stats'>
                <div className='Contributor'>
                    <svg viewBox="0 0 1152 1024" width="80" height="80" data-type="icon" class=""><path d="M768 770.612v-52.78c70.498-39.728 128-138.772 128-237.832 0-159.058 0-288-192-288s-192 128.942-192 288c0 99.060 57.502 198.104 128 237.832v52.78c-217.102 17.748-384 124.42-384 253.388h896c0-128.968-166.898-235.64-384-253.388z" data-node-id="dfc60944-e021-42cc-9b93-76fc034226d2" data-comp-instance-id="6f363700-94b8-4533-ac95-23ce0745c093" data-type="path" class=""></path><path d="M327.196 795.328c55.31-36.15 124.080-63.636 199.788-80.414-15.054-17.784-28.708-37.622-40.492-59.020-30.414-55.234-46.492-116.058-46.492-175.894 0-86.042 0-167.31 30.6-233.762 29.706-64.504 83.128-104.496 159.222-119.488-16.914-76.48-61.94-126.75-181.822-126.75-192 0-192 128.942-192 288 0 99.060 57.502 198.104 128 237.832v52.78c-217.102 17.748-384 124.42-384 253.388h279.006c14.518-12.91 30.596-25.172 48.19-36.672z" data-node-id="e1094c59-90c2-4c96-830c-0f4aa663f3b9" data-comp-instance-id="6f363700-94b8-4533-ac95-23ce0745c093" data-type="path" class=""></path></svg>
                    <Slide bottom>
                    <h3 className="ContributorTitle"><br></br>Contributors</h3><br></br>
                    </Slide>
                    <Slide bottom>
                    <h1>4</h1>
                    </Slide>
                    <Slide bottom>
                        <p>+2</p>
                    </Slide>
                </div>
                <div className='Images'>
                    <svg viewBox="0 0 1024 1024" width="80" height="80" data-type="icon" class=""><path d="M598 512h234l-234-234v234zM640 214l256 256v426q0 34-26 60t-60 26h-470q-34 0-59-26t-25-60v-598q0-34 26-59t60-25h298zM682 42v86h-512v598h-84v-598q0-34 25-60t59-26h512z" data-node-id="d2763731-c468-4c49-b959-90b02dfaf833" data-comp-instance-id="b19b7319-9b69-4f01-a6f2-8690b80f6a89" data-type="path" class=""></path></svg>
                    <Slide bottom>
                    <h3 className="ImageTitle"><br></br>Images</h3><br></br>
                    </Slide>
                    <Slide bottom>
                    <h1>2,057</h1>
                    </Slide>
                    <Slide bottom>
                        <p>+213</p>
                    </Slide>
                </div>
                <div className='Locations'>
                    <svg viewBox="0 0 1024 1024" width="90" height="90" data-type="icon" class=""><path d="M810 640v-86h-84v86h84zM810 810v-84h-84v84h84zM554 298v-84h-84v84h84zM554 470v-86h-84v86h84zM554 640v-86h-84v86h84zM554 810v-84h-84v84h84zM298 470v-86h-84v86h84zM298 640v-86h-84v86h84zM298 810v-84h-84v84h84zM640 470h256v426h-768v-598h256v-84l128-128 128 128v256z" data-node-id="8b2c9347-dac1-4599-94e0-1f05f88de32d" data-comp-instance-id="a2b4df1f-97a0-4a22-956d-22c97be9074d" data-type="path" class=""></path></svg>
                    <Slide bottom>
                    <h3 className="LocationTitle"><br></br>Locations</h3><br></br>
                    </Slide>
                    <Slide bottom>
                    <h1>42</h1>
                    </Slide>
                    <Slide bottom>
                        <p>+5</p>
                    </Slide>
                </div>
            </div>
            <div className="Intro">
                <Slide bottom>
                <img
                    src={require("../../assets/ModalitiesGif.gif")}
                />
                </Slide>
                <Slide bottom>
                <h5 className="title">What is "Ubiquitous Gesture"?</h5>
                </Slide>
            </div>
            <div className='Problems'>
                <Slide bottom>
                <p className='IntroText'>"Ubiquitous Gesture" is a concept that gestures can be made to appear anytime and everywhere.<br></br><br></br>
                    We use hand gestures to interact with mobile phones - swipe to scroll, pinch to zoom. But hands are not the only body part that can make those gestures. 
                    Imagine doing a swipe with your feet or pinching with lips... Gestures that can be "transferred" from hands to other <b><i>modalities </i></b>
                    are applicable to more situations - even when hands are occupied.<br></br><br></br>

                    <b>What are modalities? </b><br></br><br></br>

                    Modalities are body parts or means that can be used to input gestures, such as hands, feet, head, or even facial expressions, etc.

                    We envision the future popularization of Augmented Reality (AR) devices would make it possible to detect and recognize gestures from all modalities.<br></br><br></br>

                    <b>What is Ubi-Gesture? </b><br></br><br></br>
                    Ubi-Gesture is a platform that empowers the design of transferable gestures. By exploring target scenarios of gestures, Ubi-Gesture provides cues on how 
                    humans' modalities are engaged in different contexts. </p>
                </Slide>
                <Slide bottom>
                <h5 className="title">Why Ubi-Gesture?</h5>
                </Slide>
                <div className='Box'>
                    <Slide bottom>
                    <p>To design gestures based on <i>situational constraints</i> is usually 
                        <ul>
                            <li><b>data-demanding: </b>human information on the target scenarios is often insufficient,</li>
                            <li><b>laborious: </b>designers need to run participatory studies to observe and analyze use cases,</li>
                            <li><b>limited: </b>scenarios investigated are usually limited by time, space, participant groups, amount of samples, etc.</li>
                        </ul>
                    Ubi-Gesture consists of a large-scale, searchable dataset focusing on human-context information. It speeds up the design of gestures by 
                    providing rich and diverse cues based on user-specified situational constraints. 
                    </p>
                    </Slide>
                </div>
            </div>
            <div className='Sample'>
                <Slide bottom>
                <h5>Sample Images</h5>
                </Slide>
            </div>
            <div className="row">
                <div className="column">
                    <Slide bottom>
                    <img width="100%" src="https://www.eatthis.com/wp-content/uploads/sites/4/2022/07/woman-cooking.jpg?quality=82&strip=all"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://cloudfront-us-east-2.images.arcpublishing.com/reuters/UY7DGYM4XVMB3IKMYIU7C7IM3U.jpg"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://images.theconversation.com/files/223381/original/file-20180615-85822-1o2y44i.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=754&fit=clip"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://www.sassyhongkong.com/wp-content/uploads/2021/09/camping-hong-kong-whats-on.png"/>
                    </Slide>
                </div>
                <div className="column">
                    <Slide bottom>
                    <img width="100%" src="https://images.theconversation.com/files/223381/original/file-20180615-85822-1o2y44i.jpg?ixlib=rb-1.1.0&q=45&auto=format&w=754&fit=clip" />
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://www.eatthis.com/wp-content/uploads/sites/4/2022/07/woman-cooking.jpg?quality=82&strip=all"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://upload.wikimedia.org/wikipedia/commons/7/77/Deepsea.JPG"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://domf5oio6qrcr.cloudfront.net/medialibrary/11537/4a78f148-d427-4209-8173-f33d04c44106.jpg"/>
                    </Slide>
                </div>
                <div className="column">
                    <Slide bottom>
                    <img width="100%" src="https://domf5oio6qrcr.cloudfront.net/medialibrary/11537/4a78f148-d427-4209-8173-f33d04c44106.jpg"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://volleycountry.com/wp-content/uploads/2020/12/beach-game.jpeg"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://www.sassyhongkong.com/wp-content/uploads/2021/09/camping-hong-kong-whats-on.png"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://cloudfront-us-east-2.images.arcpublishing.com/reuters/UY7DGYM4XVMB3IKMYIU7C7IM3U.jpg"/>
                    </Slide>
                </div>
                <div className="column">
                    <Slide bottom>
                    <img width="100%" src="https://www.sassyhongkong.com/wp-content/uploads/2021/09/camping-hong-kong-whats-on.png"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://volleycountry.com/wp-content/uploads/2020/12/beach-game.jpeg"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://upload.wikimedia.org/wikipedia/commons/7/77/Deepsea.JPG"/>
                    </Slide>
                    <Slide bottom>
                    <img width="100%" src="https://volleycountry.com/wp-content/uploads/2020/12/beach-game.jpeg"/>
                    </Slide>
                </div>
            </div>
            <div className='Team'>
                <Slide bottom>
                <h5>Team</h5>
                </Slide>
            </div>
        </div>
)
}