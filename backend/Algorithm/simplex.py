import numpy as np
import pandas as pd
import math

def solveSimplex(model,logger):
    #load problem set
    C= np.array([model['objCoef']])
    A= np.array(model['constCoef'])
    b= np.array([model['constRHS']])
    varId= np.array(model['realVar'])

    solTracker=[]
    sol = [0]*C.size

     # sets the basic variables up
    B_index=basicVarStart(C,A,varId)
    if B_index==[]:
        return {'problemSolved':False,'iteratedSol': None}
    else:
        logger.info(B_index)
        B=np.array([list(A[:,[i]].T[0]) for i in B_index]).T

    Z=0
    check=True
    count=1
    
    # solution iteration
    while(check):
        B_inv_A =np.dot(np.linalg.inv(B),A)
        B_inv_b_T =np.dot(np.linalg.inv(B),b.T)
        C_B=np.array([[C[0,i]for i in B_index]])
        
        sol=[B_inv_b_T[list(B_index).index(i),0] if(i in B_index) else 0 for i in range(len(sol))]
        solTracker.append(sol)

        new_C=np.subtract(np.dot(C_B,B_inv_A),C)
        Z=np.dot(C_B,B_inv_b_T)
        
        check=np.any(new_C<0)
        
        if(check):
            new_index_C=np.argmin(new_C)
            extracted_col=B_inv_A[:,[new_index_C]]
            for i in range(len(extracted_col)):
                if(extracted_col[i,0]<0):
                    extracted_col[i,0]=0        
            B_index_leave= np.argmin(np.divide(B_inv_b_T,extracted_col))
            B=newB(B,B_index_leave,A,B_index,new_index_C)

        if(count>100):
            return {'problemSolved':False,'iteratedSol': solTracker}
        count+=1

    return {'problemSolved':True,'iteratedSol': solTracker}


# basic variable set for the start
def basicVarStart(C,A,varId):
    isSlackArt=(varId==0)
    temp=[]
    count=0
    numConst=A.shape[0]
    
    isBV=[list(A[:,[i]]==1).index(True) if((np.sum(A[:,[i]]==0)==(numConst-1)) & (np.sum(A[:,[i]]==1)==1) &(isSlackArt[i])) else -1 for i in range(A.shape[1])]
    #print(isBV)
    
    if (np.sum(np.array(isBV)>=0)==numConst):
        newBV=sorted([[isBV[i],i] for i in range(len(isBV))], key=lambda x: x[0])
        for x in newBV:
            if(x[0]>=0):
                temp.append(x[1])

    return temp

# select new basic variables
def newB(B,B_index_leave,A,B_index,new_index_C):
    temp=B[:,[]]
    for i in range(A.shape[0]):
        if(B_index_leave==i):
            temp=np.append(temp,A[:,[new_index_C]],axis=1)
            B_index[i]=new_index_C
        else:
            temp=np.append(temp,B[:,[i]],axis=1)
    return temp

def sampleProbSol():
    M=9999
    C=np.array([[5,4,0,0,0,-M]])
    A=np.array([[2,1,1,0,0,0],
                [1,1,0,1,0,0],
                [1,2,0,0,-1,1]])
    b=np.array([[20,18,12]])



    #var and index
    varlist = ["X1","X2","S1","S2","S3","A3"]
    sol = [0] * C.size


    # sets the basic variables up
    B_index=basicVarStart(C,A)
    if B_index==[]:
        print(warning)
    else:
        print(B_index)
        B=np.array([list(A[:,[i]].T[0]) for i in B_index]).T

    Z=0
    check=True
    count=0
    print("Beginning basic variable columns",B,sep="\n")
    while(check):
        B_inv_A =np.dot(np.linalg.inv(B),A)
        B_inv_b_T =np.dot(np.linalg.inv(B),b.T)
        C_B=np.array([[C[0,i]for i in B_index]])
        
        sol=[B_inv_b_T[list(B_index).index(i),0] if(i in B_index) else 0 for i in range(len(sol))]
        
        new_C=np.subtract(np.dot(C_B,B_inv_A),C)
        Z=np.dot(C_B,B_inv_b_T)
        
        print("inverse matrix B times matrix A",B_inv_A, sep="\n")
        print("\ninverse matrix B times inverted b",B_inv_b_T,sep="\n")
        print("\ncoefficients of Basic variables",C_B,sep="\n")
        print("\nnew coefficients",new_C,sep="\n")
        print("\ntemp sol",Z)
        check=np.any(new_C<0)
        
        if(check):
            new_index_C=np.argmin(new_C)
            print("\nnew variable coming in : ",varlist[new_index_C])
            extracted_col=B_inv_A[:,[new_index_C]]
            print("\ncolumn from constraints : ",extracted_col,sep="\n")
            for i in range(len(extracted_col)):
                if(extracted_col[i,0]<0):
                    extracted_col[i,0]=0        
            B_index_leave= np.argmin(np.divide(B_inv_b_T,extracted_col))
            B=newB(B,B_index_leave,A,B_index,new_index_C)
            print("\nnew basic variable columns",B,sep="\n")
        
        count+=1
        print("\nend of iteration #",count)
        print("*******************************************\n\n")
        if(count>5): break
    return 0