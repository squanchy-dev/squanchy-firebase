import * as express from 'express'

const patch = express()

// todo app.use(myMiddleware);

// remove /projects/squanchy-dev/databases/(default)/documents
patch.patch('/:collection/:id', (req, res) => {
    const collection = req.params.collection as string
    const id = req.params.id as string

    res.status(200).send(`Collection: ${collection}, Id: ${id}`)
})

export {
    patch
}
