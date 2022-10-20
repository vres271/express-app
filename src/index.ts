import { URIParamsCourseIdModel } from './models/URIParamsCourseIdModel';
import { CourseViewModel } from './models/CourseViewModel';
import { CoursesQueryModel } from './models/CoursesQueryModel';
import { CourseUpdateModel } from './models/CourseUpdateModel';
import { RequestWithQuery, RequestWithParams, RequestWithBody, RequestWithParamsAndBody } from './types';
import express, { query, Request, Response } from 'express';
import { CourseCreateModel } from './models/CourseCreateModel';

export const app = express()
const port = 3038

export const HTTP_STATUSES = {
    OK_200: 200,  
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404,
}

app.get('/',(req,res)=>{
    res.send(`
    <h1>Express</h1>
    <button id="sendgetBtn">GET</button>
    <button id="sendPostBtn">Send POST</button>
    <script>
      document.getElementById("sendPostBtn").addEventListener('click',async ()=>{
        let item = {
          title: 'New course 3000'
        };
        
        let response = await fetch('/courses/2', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify(item)
        });
        
        let result = await response;
        console.log( await result.json(), result);      
      })
      document.getElementById("sendgetBtn").addEventListener('click',async ()=>{
        let item = {
          title: 'New course 3000'
        };
        
        let response = await fetch('/courses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          }
        });
        
        let result = await response;
        console.log( await result.json(), result);      
      })
    </script>  
  `)
})

const jsonBodyMiddleware = express.json()

app.use(jsonBodyMiddleware)

type CourseType = {
    id:number,
    title:string,
    students:number,
}


const db = {
    courses: [
        {id:1, title:'fron-end',students: 10},
        {id:2, title:'back-end',students: 4},
        {id:3, title:'automation QA',students: 6},
        {id:4, title:'devops',students: 2}
    ]
}

const getCourseViewModel = (dbCourse:CourseType):CourseViewModel=>{
   return  {
        id: dbCourse.id,
        title: dbCourse.title,
    }    
}

app.get('/courses',(req: RequestWithQuery<CoursesQueryModel>,res: Response<CourseViewModel[]>)=>{
    let foundedCourses = db.courses;
    if(req.query.title) {
        foundedCourses = db.courses.filter(item=>item.title.indexOf(req.query.title)>-1)
    }
    res.json(foundedCourses.map(getCourseViewModel))
})

app.get('/courses/:id',(req: RequestWithParams<URIParamsCourseIdModel>,res: Response<CourseViewModel>)=>{
    const founded = db.courses.find(item=>item.id=== +req.params.id)
    if(founded) {
        res.json(getCourseViewModel(founded))
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
})

app.post('/courses',(req: RequestWithBody<CourseCreateModel>,res:Response<CourseViewModel>)=>{
    if(!req.body.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return       
    }
    const newCourse:CourseType = {
        id: +(new Date()),
        title: req.body.title,
        students: 0
    }
    db.courses.push(newCourse)
    res.status(HTTP_STATUSES.CREATED_201).json(getCourseViewModel(newCourse))
})

app.delete('/courses/:id',(req: RequestWithParams<URIParamsCourseIdModel>,res)=>{
    db.courses = db.courses.filter(item=>item.id!== +req.params.id)
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.put('/courses/:id',(req: RequestWithParamsAndBody<URIParamsCourseIdModel,CourseUpdateModel>,res)=>{
    if(!req.body.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return       
    }
    const founded = db.courses.find(item=>item.id=== +req.params.id)
    if(founded) {
        founded.title = req.body.title
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
})

app.delete('/__test__/data',(req,res)=>{
    db.courses = [];
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})


app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})


