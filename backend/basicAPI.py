import time
from flask import Flask,json, request, render_template
from dataclasses import dataclass
from .Algorithm.simplex import solveSimplex
from .Algorithm.linearEqSolve import findIntersections

'''
https://medium.com/swlh/how-to-deploy-a-react-python-flask-project-on-heroku-edb99309311

The static_folder argument tells Flask where the static folder is. By default this will be located in the same directory where the application is
The static_url_path argument tells Flask what is the URL prefix for all static files. The default is /static. By changing it to the root URL, we now don’t need to prepend every static file with /static
'''
app = Flask(__name__,static_folder='../build', static_url_path='/')

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=False, port=os.environ.get('PORT', 80))

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route("/solution", methods=['GET', 'POST'])
def send_sol():
    if request.method == 'POST':                                  
        data = json.loads(request.data)
        ss = "received the model data" 
        #app.logger.info("show model data: ",json.dumps(data))

        solution= solveSimplex(data['augmentedModel'],app.logger);
        #solution = "ha"

        response ={
            'msg': ss,
            'augmented_form': ("This is the augmented form :\n\n"+printSimplex(data['augmentedModel'])),
            'solution':solution
        }
        return json.dumps(response)
    return "error: this is only a POST method"

@app.route("/graph", methods=['GET', 'POST'])
def send_intersections():
    if request.method == 'POST':                                  
        data = json.loads(request.data)
        ss = "received the model data" 
        #app.logger.info("show model data: ",json.dumps(data))

        intersections= findIntersections(data['modelData'],app.logger);
        #solution = "ha"

        response ={
            'msg': ss,
            'summary': ("This is what backend received:\n\n"+printSimplex(data['modelData'])),
            'intersections':intersections
        }
        return json.dumps(response)
    return "error: this is only a POST method"



#if __name__ == '__main__':
#    app.run(debug=True)
    
def printSimplex(modelData):
    text= (modelData['obj'] + " : ")
    numVar= modelData["numVar"]
    text+= "".join([(str(modelData["objCoef"][i])+"*X"+str(i+1)+" + ") if i+1<numVar else (str(modelData["objCoef"][i])+"*X"+str(i+1)) for i in range(numVar)])
    text+= "\nconstraints:\n"
    for j in range(modelData["numConst"]):
        constCoef=modelData["constCoef"][j]
        text+= ("\t"+"".join([(str(constCoef[i])+"*X"+str(i+1)+" + ") if i+1<numVar else (str(constCoef[i])+"*X"+str(i+1)) for i in range(numVar)]))
        text+={"less":" <= ","equal": " = ", "great": " >= "}.get( modelData["constType"][j] ,"invalid data")
        text+=(str(modelData["constRHS"][j])+"\n")
    return text

