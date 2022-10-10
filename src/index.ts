import express, { query } from 'express';

const app = express()
const port = 3038

const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404,
}

app.get('/',(req,res)=>{
    res.send(`
    <h1>Express</h1>
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
    </script>  
  `)
})

const jsonBodyMiddleware = express.json()

app.use(jsonBodyMiddleware)

const db = {
    courses: [
        {id:1, title:'fron-end'},
        {id:2, title:'back-end'},
        {id:3, title:'automation QA'},
        {id:4, title:'devops'}
    ]
}


app.get('/courses/:id',(req,res)=>{
    const founded = db.courses.find(item=>item.id=== +req.params.id)
    if(founded) {
        res.json(founded)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
})

app.get('/courses',(req,res)=>{
    let foundedCourses = db.courses;
    if(req.query.title) {
        foundedCourses = db.courses.filter(item=>item.title.indexOf(req.query.title as string)>-1)
    }
    res.json(foundedCourses)
})

app.post('/courses',(req,res)=>{
    if(!req.body.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return       
    }
    const newCourse = {
        id: +(new Date()),
        title: req.body.title,
    }
    db.courses.push(newCourse)
    res.status(HTTP_STATUSES.CREATED_201).json(newCourse)
})

app.delete('/courses/:id',(req,res)=>{
    db.courses = db.courses.filter(item=>item.id!== +req.params.id)
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.put('/courses/:id',(req,res)=>{
    if(!req.body.title) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return       
    }
    const founded = db.courses.find(item=>item.id=== +req.params.id)
    if(founded) {
        founded.title = req.body.title
        res.json(founded)
    } else {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
})

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`)
})


