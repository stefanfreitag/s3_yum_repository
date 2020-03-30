#!/bin/bash

BUCKET_DIRECTORY="./s3_yum_repository"

download_files_centos_7(){
    CENTOS_VERION="7"
    OUTPUT_DIRECTORY="${BUCKET_DIRECTORY}/centos/${CENTOS_VERION}/x86_64"
    
    downloads=( "https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/${CENTOS_VERION}/x86_64/Packages/adoptopenjdk-13-hotspot-13+33-1.x86_64.rpm" "https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/${CENTOS_VERION}/x86_64/Packages/adoptopenjdk-13-hotspot-jre-13+33-1.x86_64.rpm" "https://d3pxv6yz143wms.cloudfront.net/11.0.3.7.1/java-11-amazon-corretto-devel-11.0.3.7-1.x86_64.rpm" )
    
    for i in "${downloads[@]}"; 
        do 
        echo "$i"; 
        wget -N $i -P ${OUTPUT_DIRECTORY}
    done
    
}

download_files_centos_8(){
    CENTOS_VERION="8"
    OUTPUT_DIRECTORY="${BUCKET_DIRECTORY}/centos/${CENTOS_VERION}/x86_64"
    downloads=( "https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/${CENTOS_VERION}/x86_64/Packages/adoptopenjdk-13-hotspot-13+33-1.x86_64.rpm" "https://adoptopenjdk.jfrog.io/adoptopenjdk/rpm/centos/${CENTOS_VERION}/x86_64/Packages/adoptopenjdk-13-hotspot-jre-13+33-1.x86_64.rpm")
    
    for i in "${downloads[@]}"; 
        do 
        echo "$i"; 
        wget -N $i -P ${OUTPUT_DIRECTORY}
    done
}


rename_files_centos_7(){    
    CENTOS_VERION="7"
    OUTPUT_DIRECTORY="${BUCKET_DIRECTORY}/centos/${CENTOS_VERION}/x86_64/*"
    
    for filename in ${OUTPUT_DIRECTORY};    
    do 
        name=${filename##*/}
        echo "$name"; 
    done
}

#download_files_centos_7
rename_files_centos_7
#download_files_centos_8