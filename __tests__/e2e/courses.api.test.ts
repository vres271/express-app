import { CourseUpdateModel } from './../../src/models/CourseUpdateModel';
import { CourseCreateModel } from './../../src/models/CourseCreateModel';

import request from 'supertest'
import { app, HTTP_STATUSES } from '../../src'

describe('Courses test API', ()=>{

    beforeAll(async ()=>{
        await request(app)
            .delete('/__test__/data')
    })

    it('Should return 200 and empty array ', async ()=>{
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200,[])
    })

    it('Should return 404 for not existing course ', async ()=>{
        await request(app)
            .get('/courses/9999')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Shouldnt create course with incorrect input data ', async ()=>{
        const data:CourseCreateModel = {title:''}
        await request(app)
            .post('/courses')
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200,[])

     })

    let createdCourse:any = null;
    it('Should create course with correct input data ', async ()=>{
        const newCourseTitle = 'it-incubator';
        const data:CourseCreateModel = {title: newCourseTitle}
        const createResponse = await request(app)
            .post('/courses')
            .send(data)
            .expect(HTTP_STATUSES.CREATED_201)

        createdCourse = createResponse.body;
        expect(createdCourse).toEqual({
            id: expect.any(Number),
            title: newCourseTitle
        })
        
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200,[createdCourse])

    })

    it('Shouldnt update course that not exist', async ()=>{
        const data:CourseUpdateModel = {title:'good title'}
        await request(app)
            .put('/courses/'+3)
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

    })

    it('Shouldnt update course with incorrect input data ', async ()=>{
        const data:CourseUpdateModel = {title:''}
        await request(app)
            .put('/courses/'+createdCourse.id)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get('/courses/'+createdCourse.id)
            .expect(HTTP_STATUSES.OK_200,createdCourse)

    })

    it('Should update course with correct input data ', async ()=>{
        const newCourseTitle = 'good title';
        const data:CourseUpdateModel = {title:newCourseTitle}
        await request(app)
            .put('/courses/'+createdCourse.id)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/courses/'+createdCourse.id)
            .expect(HTTP_STATUSES.OK_200,{
                ...createdCourse,
                title:newCourseTitle
            })

    })

    it('Should delete course  ', async ()=>{
        const newCourseTitle = 'good title';
        await request(app)
            .delete('/courses/'+createdCourse.id)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/courses/'+createdCourse.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
            
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200,[])

    })

    

})