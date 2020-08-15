import numpy as np
import pandas as pd
import math, copy

def findIntersections(model,logger):
    #load problem set
    A= np.array(model['constCoef'])
    b= np.array([model['constRHS']])
    numConst = model["numConst"]
    numVar = model["numVar"]

    return returnIntersections(A,b,numConst,numVar)

#combinations of linear equations
# ie) given 10 constraints and 2 variables in objective functions, there would be 10!/(2!(10-2)!) combinations of linear equations 
def combination(n,k,it,tracker,result):
    if(k==0):
        result.append(tracker)
        return
    for i in range(it,n):
        tracker2=copy.copy(tracker)
        tracker2.append(i)
        combination(n,k-1,i+1,tracker2,result)

#performs a simple Gaussian Jordan method
def gaussJordan(matrix):
    mat=np.copy(matrix)
    if(mat[0,0]==0):
        switch=[True if mat[j,0]!=0 else False for j in range(mat.shape[0])].index(True)
        temp=np.copy(mat[0])
        mat[0]=np.copy(mat[switch])
        mat[switch]=temp
    for i in range(mat.shape[1]-1):
        mat[i]=mat[i]/mat[i,i]
        for j in range(mat.shape[1]-1):
            if(i!=j):
                mat[j]=mat[j]-mat[i]*mat[j,i]
    coeff=mat[:,0:(mat.shape[1]-1)]
    RHS=mat[:,[mat.shape[1]-1]]

    return list(np.dot(coeff,RHS).T[0])

# returns solution sets of intersection
def returnIntersections(A,b,numConst,numVar):
    numGaussian=[]
    sol=[]
    combination(numConst,numVar,0,[],numGaussian)
    for i in numGaussian:
        gaussian=[]
        for j in i:
            eq=np.copy(A[j])
            gaussian.append(np.append(eq,b[0][j]))
        sol.append(gaussJordan(np.array(gaussian,dtype=float)))
    return sol